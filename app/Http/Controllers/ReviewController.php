<?php

namespace App\Http\Controllers;

use App\Models\Review;
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

    public function index()
    {
        Log::info('Fetching all top-level reviews');

        $reviews = Review::with(['user', 'images', 'replies'])->whereNull('parent_id')
            ->orderBy('created_at', 'desc')->get();

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
                    $review->images()->create(['image_path' => $path]);
                    Log::info('Stored review image', ['path' => $path]);
                } catch (\Exception $e) {
                    Log::error('Failed to store image', ['error' => $e->getMessage()]);
                    // Optionally add an error flash here
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
                Storage::disk('public')->delete($image->image_path);
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
        Log::info('Updating review', ['review_id' => $review->id, 'input' => $request->all()]);

        $validated = Validator::make($request->all(), [
            'content' => 'required|string|max:300',
            'rating' => 'sometimes|required|numeric|min:0.5|max:5',
            'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:5120',
            'deleted_image_ids' => 'sometimes|array',
            'deleted_image_ids.*' => 'integer|exists:review_images,id',
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
                $image = ReviewImage::find($imageId);
                if ($image && $image->review_id === $review->id) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                    Log::info('Deleted review image', ['image_id' => $imageId]);
                }
            }
        }

        if ($request->hasFile('images')) {
            Log::info('Adding new images to review', ['review_id' => $review->id]);
            foreach ($request->file('images') as $file) {
                $path = $file->store('review_images', 'public');
                ReviewImage::create([
                    'review_id' => $review->id,
                    'image_path' => $path,
                ]);
                Log::info('Stored new review image', ['path' => $path]);
            }
        }

        $review->load('images');
        Log::info('Final review state after update', ['review_id' => $review->id]);

        return Redirect::back()->with('review', $review);
    }
}
