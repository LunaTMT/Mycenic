<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Reply;
use App\Models\ReviewImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\OpenAIModerationService;

use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ReviewController extends Controller
{
    protected OpenAIModerationService $moderationService;

    public function __construct(OpenAIModerationService $moderationService)
    {
        Log::info('ReviewController initialized');
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

        Log::info('Returning review with images, user, replies loaded', ['review_id' => $review->id]);

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
            Log::info("Parent review found", ['review_id' => $parentId]);
        } else if ($parentType === 'reply') {
            $parent = Reply::findOrFail($parentId);
            Log::info("Parent reply found", ['reply_id' => $parentId]);
        } else {
            Log::error('Invalid parent type provided for reply', ['parent_type' => $parentType]);
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
            Log::info('Review found for deletion', ['review_id' => $reviewId]);

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
        Log::info('Deleting review images', ['review_id' => $review->id]);
        foreach ($review->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
            Log::info('Deleted image from review', ['image_id' => $image->id]);
        }

        Log::info('Deleting replies for review', ['review_id' => $review->id]);
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
        Log::info('Deleting nested replies for reply', ['reply_id' => $reply->id]);
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
        Log::info('Fetching single review', ['review_id' => $id]);
        $review = Review::with(['user', 'images', 'replies.user', 'replies.replies'])->findOrFail($id);
        Log::info('Fetched single review', ['review_id' => $id]);

        return response()->json($review);
    }

    /**
     * Update an existing review.
     */
    public function update(Request $request, Review $review)
    {
        Log::info('Updating review', ['review_id' => $review->id, 'input' => $request->all()]);

        $validated = Validator::make($request->all(), [
            'content' => 'required|string|max:300',
            'rating' => 'sometimes|required|numeric|min:0.5|max:5',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:5120',
            'deleted_image_ids' => 'sometimes|array',
            'deleted_image_ids.*' => 'integer|exists:review_images,id',
        ]);

        if ($validated->fails()) {
            Log::warning('Review update validation failed', ['errors' => $validated->errors()]);
            return redirect()->back()->withErrors($validated)->withInput();
        }

        $updateData = [];
        if ($request->has('content')) {
            $updateData['content'] = $request->input('content');
        }
        if ($request->has('rating')) {
            $updateData['rating'] = $request->input('rating');
        }

        if (!empty($updateData)) {
            $review->update($updateData);
            Log::info('Review updated content and/or rating', ['review_id' => $review->id, 'updated_fields' => array_keys($updateData)]);
        } else {
            Log::info('No content or rating to update for review', ['review_id' => $review->id]);
        }

        // Delete requested images
        if ($request->has('deleted_image_ids')) {
            Log::info('Deleting images from review update', ['review_id' => $review->id, 'deleted_image_ids' => $request->input('deleted_image_ids')]);
            foreach ($request->input('deleted_image_ids') as $imageId) {
                $image = ReviewImage::find($imageId);
                if ($image && $image->review_id === $review->id) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                    Log::info('Deleted review image', ['image_id' => $imageId]);
                }
            }
        }

        // Add new uploaded images
        if ($request->hasFile('images')) {
            Log::info('Adding new images to review', ['review_id' => $review->id]);
            foreach ($request->file('images') as $file) {
                $path = $file->store('reviews', 'public');
                ReviewImage::create([
                    'review_id' => $review->id,
                    'path' => $path,
                ]);
                Log::info('Stored new review image', ['path' => $path]);
            }
        }

        // Reload images
        $review->load('images');
        Log::info('Reloaded images after update', ['review_id' => $review->id]);

        Log::info('Redirecting back after review update', ['review_id' => $review->id]);
        return redirect()->back()->with('review', $review);
    }

}
