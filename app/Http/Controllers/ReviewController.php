<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Reply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\OpenAIModerationService;

class ReviewController extends Controller
{
    protected OpenAIModerationService $moderationService;

    public function __construct(OpenAIModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }

    /**
     * Fetch all top-level reviews with user, images and nested replies recursively.
     */
    public function index()
    {
        Log::info('Fetching all top-level reviews');
        $reviews = Review::with(['user', 'images', 'replies.user', 'replies.replies'])
            ->orderBy('created_at', 'desc')
            ->get();

        
        return response()->json($reviews);
    }

    /**
     * Store a new top-level review.
     */
    public function store(Request $request)
    {
        Log::info('Received review submission', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
        ]);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'rating' => 'required|numeric|min:1|max:5',
            'item_id' => 'required|integer|exists:items,id',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,bmp,gif,svg,webp|max:2048',
        ]);

        try {
            $review = Review::create([
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'rating' => $validated['rating'],
                'item_id' => $validated['item_id'],
            ]);
            Log::info('Review created', ['review_id' => $review->id]);
        } catch (\Exception $e) {
            Log::error('Error creating review', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create review'], 500);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                try {
                    $path = $imageFile->store('review_images', 'public');
                    $review->images()->create(['image_path' => $path]);
                    Log::info('Stored review image', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Failed to store image', ['error' => $e->getMessage()]);
                }
            }
        }

        return response()->json([
            'message' => 'Review submitted successfully.',
            'review' => $review->load('images', 'user', 'replies'),
        ]);
    }

    /**
     * Submit a reply to a review or a reply (nested).
     * 
     * @param Request $request
     * @param int $parentId
     * @param string $parentType 'review' or 'reply'
     */
    public function reply(Request $request, int $parentId, string $parentType = 'review')
    {
        $user = Auth::user();
        Log::info('Submitting reply', [
            'user_id' => $user?->id,
            'parent_id' => $parentId,
            'parent_type' => $parentType,
            'input' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:300',
        ]);

        if ($validator->fails()) {
            Log::warning('Reply validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($parentType === 'review') {
            $parent = Review::findOrFail($parentId);
        } else if ($parentType === 'reply') {
            $parent = Reply::findOrFail($parentId);
        } else {
            return response()->json(['error' => 'Invalid parent type'], 400);
        }

        try {
            $reply = new Reply([
                'user_id' => $user->id,
                'content' => $request->input('content'),
                'likes' => 0,
                'dislikes' => 0,
            ]);
            $parent->replies()->save($reply);

            Log::info('Reply submitted successfully', ['reply_id' => $reply->id]);
            return response()->json(['message' => 'Reply submitted successfully', 'reply' => $reply], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit reply', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit reply'], 500);
        }
    }

    /**
     * Delete a review and its nested replies recursively.
     */
    public function destroy(int $reviewId)
    {
        $user = Auth::user();
        Log::info('Delete review request', ['user_id' => $user?->id, 'review_id' => $reviewId]);

        try {
            $review = Review::with(['images', 'replies'])->findOrFail($reviewId);

            if (!$user) {
                Log::warning('Unauthenticated user tried to delete review');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if (!$user->isAdmin() && $review->user_id !== $user->id) {
                Log::warning('Unauthorized user tried to delete review', ['user_id' => $user->id]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $this->deleteReviewWithReplies($review);

            Log::info('Review deleted successfully', ['review_id' => $reviewId]);
            return response()->json(['message' => 'Review deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete review', ['error' => $e->getMessage(), 'review_id' => $reviewId]);
            return response()->json(['error' => 'Failed to delete review'], 500);
        }
    }

    /**
     * Recursively delete review with images and replies.
     */
    protected function deleteReviewWithReplies(Review $review)
    {
        foreach ($review->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
            Log::info('Deleted image from review', ['image_id' => $image->id]);
        }

        foreach ($review->replies as $reply) {
            $this->deleteReplyWithReplies($reply);
        }

        $review->delete();
        Log::info('Deleted review', ['review_id' => $review->id]);
    }

    /**
     * Recursively delete reply and nested replies.
     */
    protected function deleteReplyWithReplies(Reply $reply)
    {
        // Since replies do NOT have images, skip image deletion here.

        foreach ($reply->replies as $nestedReply) {
            $this->deleteReplyWithReplies($nestedReply);
        }

        $reply->delete();
        Log::info('Deleted reply', ['reply_id' => $reply->id]);
    }

    /**
     * Show a single review with nested replies.
     */
    public function show(int $id)
    {
        $review = Review::with(['user', 'images', 'replies.user', 'replies.replies'])->findOrFail($id);
        Log::info('Fetched single review', ['review_id' => $id]);
        return response()->json($review);
    }

    public function update(Request $request, int $id, string $type = 'review')
    {
        $user = Auth::user();

        // Validate common fields
        $rules = ['content' => 'required|string|max:300'];
        if ($type === 'review') {
            $rules['rating'] = 'required|numeric|min:1|max:5';
        }

        $validated = $request->validate($rules);

        if ($type === 'review') {
            $model = Review::findOrFail($id);
        } elseif ($type === 'reply') {
            $model = Reply::findOrFail($id);
        } else {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        // Authorization: only owner or admin can update
        if (!$user || (!$user->isAdmin() && $model->user_id !== $user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $model->content = $validated['content'];

        if ($type === 'review' && isset($validated['rating'])) {
            $model->rating = $validated['rating'];
        }

        $model->save();

        return response()->json(['message' => ucfirst($type) . ' updated successfully', $type => $model]);
    }

}
