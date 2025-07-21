<?php

namespace App\Http\Controllers;

use App\Models\Review;
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
     * Fetch all top-level reviews with relations.
     */
    public function index()
    {
        Log::info('Fetching all top-level reviews');
        $reviews = Review::with(['user', 'repliesRecursive', 'images'])
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Fetched ' . $reviews->count() . ' top-level reviews');
        return response()->json($reviews);
    }

    /**
     * Store a new review with moderation and image handling.
     */
    public function store(Request $request)
    {
        Log::info('Received review submission', [
            'user_id' => auth()->id(),
            'input' => $request->all(),
        ]);

        // Validate request inputs
        try {
            $validated = $request->validate([
                'content' => 'required|string|max:5000',
                'rating' => 'required|numeric|min:1|max:5',
                'item_id' => 'required|integer|exists:items,id',
                'images' => 'sometimes|array',
                'images.*' => 'image|mimes:jpeg,jpg,png,bmp,gif,svg,webp|max:2048',
            ]);
            Log::info('Review input validation passed');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Review input validation failed', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        }

        // === Moderation logic commented out ===
        /*
        try {
            $moderationResult = $this->moderationService->moderateText($validated['content']);
            Log::info('Moderation result', [
                'flagged' => $moderationResult['flagged'],
                'categories' => $moderationResult['categories'],
                'category_scores' => $moderationResult['category_scores'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Moderation service error: ' . $e->getMessage());
            return response()->json(['message' => 'Moderation service unavailable'], 503);
        }

        if ($moderationResult['flagged']) {
            Log::warning('Review content flagged by moderation', [
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'categories' => $moderationResult['categories'],
            ]);
            return response()->json([
                'message' => 'Your content was flagged as inappropriate.',
                'categories' => $moderationResult['categories'],
                'scores' => $moderationResult['category_scores'] ?? null,
            ], 422);
        }
        */

        // Create the review
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

        // Handle uploaded images
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            Log::info('Processing uploaded images', ['count' => count($files)]);

            foreach ($files as $imageFile) {
                try {
                    $path = $imageFile->store('review_images', 'public');
                    $review->images()->create(['image_path' => $path]);
                    Log::info('Stored review image', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Failed to store image', ['error' => $e->getMessage()]);
                }
            }
        }

        Log::info('Review store process completed successfully', ['review_id' => $review->id]);

        return response()->json([
            'message' => 'Review submitted successfully.',
            'review' => $review->load('images', 'user'),
        ]);
    }


    /**
     * Submit a reply to an existing review.
     */
    public function reply(Request $request, int $reviewId)
    {
        $user = Auth::user();
        Log::info('Submitting reply', [
            'user_id' => $user?->id,
            'review_id' => $reviewId,
            'input' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:300',
        ]);

        if ($validator->fails()) {
            Log::warning('Reply validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $parentReview = Review::findOrFail($reviewId);

            $reply = new Review([
                'user_id' => $user->id,
                'content' => $request->input('content'),
                'category' => $parentReview->category,
                'item_id' => $parentReview->item_id,
                'likes' => 0,
                'dislikes' => 0,
                'parent_id' => $parentReview->id,
                'rating' => 0,
            ]);
            $reply->save();

            Log::info('Reply submitted successfully', ['reply_id' => $reply->id]);
            return response()->json(['message' => 'Reply submitted successfully', 'review' => $reply], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit reply', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit reply'], 500);
        }
    }

    /**
     * Handle voting on a review (like/dislike).
     */
    public function vote(Request $request, Review $review)
    {
        $vote = $request->input('vote'); // 'like' or 'dislike'
        $user = $request->user();
        $guestToken = $user ? null : ($request->cookie('guest_token') ?? $request->input('guest_token'));

        Log::info('Vote request', [
            'user_id' => $user?->id,
            'guest_token' => $guestToken,
            'vote' => $vote,
            'review_id' => $review->id,
        ]);

        if (!in_array($vote, ['like', 'dislike'])) {
            Log::warning('Invalid vote value', ['vote' => $vote]);
            return response()->json(['error' => 'Invalid vote value'], 400);
        }

        if (!$user && !$guestToken) {
            Log::warning('Missing guest token for anonymous vote');
            return response()->json(['error' => 'Missing guest token'], 400);
        }

        $existingVote = $review->votes()
            ->when($user, fn($q) => $q->where('user_id', $user->id))
            ->when(!$user, fn($q) => $q->where('guest_token', $guestToken))
            ->first();

        if ($existingVote) {
            Log::info('Existing vote found', ['vote' => $existingVote->vote]);

            if ($existingVote->vote === $vote) {
                // Toggle off
                if ($vote === 'like') {
                    $review->likes = max(0, $review->likes - 1);
                } else {
                    $review->dislikes = max(0, $review->dislikes - 1);
                }
                $review->save();
                $existingVote->delete();

                return response()->json([
                    'message' => 'Vote removed',
                    'likes' => $review->likes,
                    'dislikes' => $review->dislikes,
                ]);
            } else {
                // Update vote
                if ($existingVote->vote === 'like') {
                    $review->likes = max(0, $review->likes - 1);
                } else {
                    $review->dislikes = max(0, $review->dislikes - 1);
                }

                if ($vote === 'like') {
                    $review->likes += 1;
                } else {
                    $review->dislikes += 1;
                }
                $review->save();

                $existingVote->vote = $vote;
                $existingVote->save();

                return response()->json([
                    'message' => 'Vote updated',
                    'likes' => $review->likes,
                    'dislikes' => $review->dislikes,
                ]);
            }
        } else {
            Log::info('No existing vote found, creating new vote');

            if ($vote === 'like') {
                $review->likes += 1;
            } else {
                $review->dislikes += 1;
            }
            $review->save();

            $review->votes()->create([
                'user_id' => $user?->id,
                'guest_token' => $guestToken,
                'vote' => $vote,
            ]);

            return response()->json([
                'message' => 'Vote added',
                'likes' => $review->likes,
                'dislikes' => $review->dislikes,
            ]);
        }
    }

    /**
     * Update a review with content, rating, image additions and deletions.
     */
    public function update(Request $request, Review $review)
    {
        Log::info('Updating review', ['review_id' => $review->id]);

        try {
            $validated = $request->validate([
                'content' => 'required|string|max:300',
                'rating' => 'required|numeric|min:0.5|max:5',
                'deleted_image_ids' => 'sometimes|array',
                'deleted_image_ids.*' => 'integer|exists:review_images,id',
                'images' => 'sometimes|array',
                'images.*' => 'image|mimes:jpeg,jpg,png,bmp,gif,svg,webp|max:2048',
            ]);
            Log::info('Review update validation passed');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Review update validation failed', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        }

        $review->content = $validated['content'];
        $review->rating = $validated['rating'];
        $review->save();

        Log::info('Review content and rating updated', ['review_id' => $review->id]);

        // Delete images marked for deletion
        if (!empty($validated['deleted_image_ids'])) {
            foreach ($validated['deleted_image_ids'] as $imageId) {
                $image = $review->images()->find($imageId);
                if ($image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                    Log::info('Deleted review image', ['image_id' => $imageId]);
                } else {
                    Log::warning('Attempt to delete non-existent image', ['image_id' => $imageId]);
                }
            }
        }

        // Store new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('review_images', 'public');
                $review->images()->create(['image_path' => $path]);
                Log::info('Added new review image', ['path' => $path]);
            }
        }

        $review->load('images');

        Log::info('Review update process completed', ['review_id' => $review->id]);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load(['user', 'images', 'repliesRecursive']),
        ]);
    }

    /**
     * Delete a review and its replies recursively.
     */
    public function destroy(int $reviewId)
    {
        $user = Auth::user();
        Log::info('Delete review request', ['user_id' => $user?->id, 'review_id' => $reviewId]);

        try {
            $review = Review::with(['images', 'repliesRecursive.images'])->findOrFail($reviewId);

            if (!$user) {
                Log::warning('Unauthenticated user tried to delete review');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if (!$user->isAdmin() && $review->user_id !== $user->id) {
                Log::warning('Unauthorized user tried to delete review', ['user_id' => $user->id]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $this->deleteWithReplies($review);

            Log::info('Review deleted successfully', ['review_id' => $reviewId]);
            return response()->json(['message' => 'Review deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete review', ['error' => $e->getMessage(), 'review_id' => $reviewId]);
            return response()->json(['error' => 'Failed to delete review'], 500);
        }
    }

    /**
     * Helper to recursively delete review and all child replies, images and votes.
     */
    protected function deleteWithReplies(Review $review)
    {
        // Delete images
        foreach ($review->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
            Log::info('Deleted image from review', ['image_id' => $image->id]);
        }

        // Delete votes
        $review->votes()->delete();
        Log::info('Deleted votes for review', ['review_id' => $review->id]);

        // Recursively delete replies
        foreach ($review->repliesRecursive as $reply) {
            $this->deleteWithReplies($reply);
        }

        // Delete review itself
        $review->delete();
        Log::info('Deleted review', ['review_id' => $review->id]);
    }

    /**
     * Increment like or dislike count.
     */
    public function likeDislike(Request $request, int $reviewId)
    {
        $user = Auth::user();
        $action = $request->input('action');

        Log::info('Like/dislike action received', [
            'user_id' => $user?->id,
            'review_id' => $reviewId,
            'action' => $action,
        ]);

        try {
            $review = Review::findOrFail($reviewId);

            if ($action === 'like') {
                $review->likes += 1;
            } elseif ($action === 'dislike') {
                $review->dislikes += 1;
            } else {
                Log::warning('Invalid like/dislike action', ['action' => $action]);
                return response()->json(['error' => 'Invalid action'], 400);
            }

            $review->save();

            Log::info('Like/dislike updated successfully', ['review_id' => $reviewId]);
            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $review,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update like/dislike', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update review'], 500);
        }
    }

    /**
     * Show a single review with relations.
     */
    public function show($id)
    {
        $review = Review::with(['user', 'images', 'repliesRecursive'])->findOrFail($id);
        Log::info('Fetched single review', ['review_id' => $id]);
        return response()->json($review);
    }
}
