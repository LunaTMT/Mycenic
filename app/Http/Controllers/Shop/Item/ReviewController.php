<?php

namespace App\Http\Controllers\Shop\Item;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Image;  // Use general Image model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\OpenAIModerationService;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;


class ReviewController extends Controller
{
    protected OpenAIModerationService $moderationService;

    public function __construct(OpenAIModerationService $moderationService)
    {
        Log::info('ReviewController initialized');
        $this->moderationService = $moderationService;
    }
    
    public function index(Request $request)
    {
        Log::info('Review index called', ['query_params' => $request->query()]);

        $userId = $request->query('user_id');
        $itemId = $request->query('item_id');
        $currentUser = $request->user();

        if ($userId) {
            // Only allow if admin or the current user matches the requested user_id
            if (!$currentUser->isAdmin() && $currentUser->id !== (int)$userId) {
                Log::warning('Unauthorized user review fetch attempt', [
                    'requested_user_id' => $userId,
                    'current_user_id' => $currentUser->id,
                ]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $reviews = Review::with(['user.avatar', 'images', 'replies'])
                ->whereNull('parent_id')          // ✅ top-level only
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Returning top-level reviews count for user', [
                'count' => $reviews->count(),
                'user_id' => $userId
            ]);

            return response()->json($reviews);
        }

        // Fallback: require item_id
        if (!$itemId) {
            Log::warning('No item_id provided');
            return response()->json(['error' => 'Item ID is required'], 400);
        }

        $reviews = Review::with(['user.avatar', 'images', 'replies'])
            ->whereNull('parent_id')          // ✅ top-level only
            ->where('item_id', $itemId)
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Returning top-level reviews count', ['count' => $reviews->count(), 'item_id' => $itemId]);

        return response()->json($reviews);
    }


    public function store(Request $request)
    {
        Log::info('Received review submission', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
        ]);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'rating' => 'nullable|numeric|min:0|max:5',
            'item_id' => 'required|integer|exists:items,id',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,bmp,gif,svg,webp|max:2048',
        ]);

        try {
            $review = Review::create([
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'rating' => $validated['rating'] ?? 0,
                'item_id' => $validated['item_id'],
                'parent_id' => $validated['parent_id'] ?? null,
            ]);
            Log::info('Review created', ['review_id' => $review->id]);
        } catch (\Exception $e) {
            Log::error('Error creating review', ['error' => $e->getMessage()]);
            return redirect()->back()->withErrors(['review' => 'Failed to create review.']);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                try {
                    $path = $imageFile->store('review_images', 'public');
                    $review->images()->create(['path' => $path]);
                    Log::info('Stored review image', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Failed to store image', ['error' => $e->getMessage()]);
                }
            }
        }

        return redirect()->back()->with('success', 'Review submitted successfully.');
    }

    public function vote(Request $request, Review $review)
    {
        $vote = $request->input('vote'); // 'like' or 'dislike'
        $user = $request->user();
        $guestToken = $user ? null : ($request->cookie('guest_token') ?? $request->input('guest_token'));

        if (!in_array($vote, ['like', 'dislike'])) {
            return response()->json(['error' => 'Invalid vote value'], 400);
        }

        if (!$user && !$guestToken) {
            return response()->json(['error' => 'Missing guest token'], 400);
        }

        DB::transaction(function () use ($review, $vote, $user, $guestToken, &$response) {
            // Find existing vote
            $existingVote = $review->votes()
                ->when($user, fn($q) => $q->where('user_id', $user->id))
                ->when(!$user, fn($q) => $q->where('guest_token', $guestToken))
                ->lockForUpdate() // prevent race conditions
                ->first();

            $adjustCounts = fn($type, $delta) => $review->update([
                $type === 'like' ? 'likes' : 'dislikes' => max(0, $review->{$type === 'like' ? 'likes' : 'dislikes'} + $delta)
            ]);

            if ($existingVote) {
                if ($existingVote->vote === $vote) {
                    // Remove vote
                    $adjustCounts($vote, -1);
                    $existingVote->delete();
                    $message = 'Vote removed';
                } else {
                    // Switch vote
                    $adjustCounts($existingVote->vote, -1);
                    $adjustCounts($vote, 1);
                    $existingVote->update(['vote' => $vote]);
                    $message = 'Vote updated';
                }
            } else {
                // New vote
                $adjustCounts($vote, 1);
                $review->votes()->create([
                    'user_id' => $user?->id,
                    'guest_token' => $guestToken,
                    'vote' => $vote,
                ]);
                $message = 'Vote added';
            }

            $response = [
                'message' => $message,
                'likes' => $review->likes,
                'dislikes' => $review->dislikes,
            ];
        });

        return response()->json($response);
    }



    public function reply(Request $request, $reviewId)
    {
        Log::info('Attempting to reply to review', [
            'review_id' => $reviewId,
            'user_id' => auth()->id(),
            'payload' => $request->all(),
        ]);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        try {
            $parent = Review::findOrFail($reviewId);

            $reply = Review::create([
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'parent_id' => $reviewId,
                'item_id' => $parent->item_id,
                'rating' => 0,
            ]);

            return redirect()->back()->with('success', 'Reply added successfully');

        } catch (\Exception $e) {
            Log::error('Failed to reply to review', [
                'review_id' => $reviewId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reply to review',
            ], 500);
        }
    }

    public function destroy(int $reviewId)
    {
        $user = Auth::user();
        Log::info('Delete review request', [
            'user_id' => $user?->id,
            'review_id' => $reviewId
        ]);

        try {
            $review = Review::with(['images', 'replies'])->findOrFail($reviewId);

            if (!$user) {
                Log::warning('Unauthenticated user tried to delete review');
                return redirect()->back()->withErrors(['error' => 'Unauthenticated']);
            }

            if (!$user->isAdmin() && $review->user_id !== $user->id) {
                Log::warning('Unauthorized user tried to delete review');
                return redirect()->back()->withErrors(['error' => 'Unauthorized']);
            }

            $this->deleteReviewWithReplies($review);

            Log::info('Review deleted successfully');
            return redirect()->back()->with('success', 'Review deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to delete review', [
                'review_id' => $reviewId,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->withErrors(['error' => 'Failed to delete review']);
        }
    }

    protected function deleteReviewWithReplies(Review $review)
    {
        Log::info('Starting recursive delete for review', ['review_id' => $review->id]);

        foreach ($review->images as $image) {
            try {
                Storage::disk('public')->delete($image->path);
                $image->delete();
                Log::info('Deleted image from review', ['image_id' => $image->id]);
            } catch (\Exception $e) {
                Log::error('Failed to delete review image', [
                    'image_id' => $image->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        foreach ($review->replies as $reply) {
            $this->deleteReviewWithReplies($reply);
        }

        $review->delete();
        Log::info('Deleted review', ['review_id' => $review->id]);
    }

    public function show(int $id)
    {
        Log::info('Fetching single review', ['review_id' => $id]);

        try {
            $review = Review::with(['user', 'images', 'replies.user', 'replies.replies'])->findOrFail($id);
            Log::info('Fetched single review successfully', ['review_id' => $id]);
            return response()->json($review);
        } catch (\Exception $e) {
            Log::error('Failed to fetch review', ['review_id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Review not found'], 404);
        }
    }

    public function update(Request $request, Review $review)
    {
        Log::info("Updating review input", $request->all());

        $validated = Validator::make($request->all(), [
            'content' => 'sometimes|string|max:300',
            'rating' => 'sometimes|required|numeric|min:0.5|max:5',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:5120',
            'deleted_image_ids' => 'sometimes|array',
            'deleted_image_ids.*' => 'integer|exists:images,id',
        ]);

        if ($validated->fails()) {
            Log::warning('Validation failed on review update', ['errors' => $validated->errors()]);
            return Redirect::back()->withErrors($validated)->withInput();
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
            Log::info('Review content or rating updated', [
                'review_id' => $review->id,
                'fields' => array_keys($updateData),
            ]);
        }

        if ($request->has('deleted_image_ids')) {
            Log::info('Deleting images from review', ['review_id' => $review->id]);
            foreach ($request->input('deleted_image_ids') as $imageId) {
                $image = Image::find($imageId);
                if ($image && $image->imageable_type === Review::class && $image->imageable_id === $review->id) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $image->path));
                    $image->delete();
                    Log::info('Deleted review image', ['image_id' => $imageId]);
                }
            }
        }

        if ($request->hasFile('images')) {
            Log::info('Adding new images to review', ['review_id' => $review->id]);
            foreach ($request->file('images') as $file) {
                $path = $file->store('review_images', 'public'); // stored in storage/app/public/review_images
                $publicPath = Storage::url($path); // "/storage/review_images/filename.jpg"

                $review->images()->create([
                    'path' => $publicPath,
                ]);

                Log::info('Stored new review image', ['path' => $publicPath]);
            }
        }

        $review->load('images');
        Log::info('Final review state after update', ['review_id' => $review->id]);

        return Redirect::back()->with('review', $review);
    }

}
