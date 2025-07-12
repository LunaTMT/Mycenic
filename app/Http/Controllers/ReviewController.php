<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\ReviewImage;
use Illuminate\Support\Facades\Storage;


class ReviewController extends Controller
{
    // List top-level reviews with their recursive replies and users
    public function index()
    {
        Log::info('Fetching all top-level reviews');
        
        $reviews = Review::with(['user', 'repliesRecursive', 'images'])
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Number of top-level reviews fetched: ' . $reviews->count());

        return response()->json($reviews);
    }
    
    // Store a new review (top-level)
    public function store(Request $request)
    {
        $user = Auth::user();
        Log::info('Attempting to submit a review', ['user_id' => $user?->id, 'request' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'content' => 'nullable|max:300',   // content can be empty (nullable)
            'category' => 'nullable|string',
            'rating' => 'required|numeric|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048', // validate each image file
            'images' => 'array|max:5', // max 5 images
        ]);

        if ($validator->fails()) {
            Log::warning('Review validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $review = new Review();
            $review->user_id = $user->id;
            $review->content = $request->input('content');
            $review->category = $request->input('category', 'general');
            $review->rating = $request->input('rating');
            $review->likes = 0;
            $review->dislikes = 0;
            $review->parent_id = null; // top-level
            $review->item_id = $request->input('item_id'); // make sure this is passed and validated
            $review->save();

            // Handle images if uploaded
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $imageFile) {
                    $path = $imageFile->store('review_images', 'public'); // store in storage/app/public/review_images
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'image_path' => $path,
                    ]);
                }
            }

            Log::info('Review submitted successfully', ['review_id' => $review->id]);
            return response()->json(['message' => 'Review submitted successfully', 'review' => $review], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit review', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit review'], 500);
        }
    }


    // Store a reply to a review
    public function reply(Request $request, int $reviewId)
    {
        $user = Auth::user();
        Log::info('Attempting to submit a reply', [
            'user_id' => $user?->id,
            'reviewId' => $reviewId,
            'request' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required|max:300',
        ]);

        if ($validator->fails()) {
            Log::warning('Reply validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $parentReview = Review::findOrFail($reviewId);

            $reply = new Review();
            $reply->user_id = $user->id;
            $reply->content = $request->input('content');
            $reply->category = $parentReview->category;
            $reply->likes = 0;
            $reply->dislikes = 0;
            $reply->parent_id = $parentReview->id;
            $reply->rating = null; // replies might not have rating
            $reply->save();

            Log::info('Reply submitted successfully', ['reply_id' => $reply->id]);
            return response()->json(['message' => 'Reply submitted successfully', 'review' => $reply], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit reply', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit reply'], 500);
        }
    }

    // Update a review or reply (only if owner or admin)
    public function update(Request $request, int $reviewId)
    {
        Log::info("updating");
        $user = Auth::user();
        Log::info('Attempting to update review', [
            'user_id' => $user?->id,
            'reviewId' => $reviewId,
            'request' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required|max:300',
        ]);

        if ($validator->fails()) {
            Log::warning('Update validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $review = Review::findOrFail($reviewId);

            if ($review->user_id !== $user->id && !$user->isAdmin()) {
                Log::warning('Unauthorized review update attempt', [
                    'user_id' => $user->id ?? null,
                    'review_user_id' => $review->user_id
                ]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $review->content = $request->input('content');
            $review->save();

            Log::info('Review updated successfully', ['review_id' => $review->id]);
            return response()->json(['message' => 'Review updated successfully', 'review' => $review], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update review', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update review'], 500);
        }
    }

    // Delete a review or reply (only if owner or admin)
    public function destroy(int $reviewId)
    {
        $user = Auth::user();
        Log::info('Attempting to delete review', ['user_id' => $user?->id, 'review_id' => $reviewId]);

        try {
            $review = Review::findOrFail($reviewId);

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if (!$user->isAdmin() && $review->user_id !== $user->id) {
                Log::warning('Unauthorized delete attempt', [
                    'user_id' => $user->id,
                    'review_user_id' => $review->user_id,
                ]);
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($review->parent_id === null) {
                // Top-level: delete recursively
                $this->deleteWithReplies($review);
            } else {
                // Reassign child replies to parent (orphan replies)
                Review::where('parent_id', $review->id)
                    ->update(['parent_id' => $review->parent_id]);

                $review->delete();
            }

            Log::info('Review deleted successfully', ['review_id' => $reviewId]);
            return response()->json(['message' => 'Review deleted successfully.'], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete review', ['error' => $e->getMessage(), 'review_id' => $reviewId]);
            return response()->json(['error' => 'Failed to delete review'], 500);
        }
    }

    /**
     * Recursively delete a review and all its replies
     */
    protected function deleteWithReplies(Review $review)
    {
        // Delete related images
        foreach ($review->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        if ($review->replies()->count() > 0) {
            foreach ($review->replies as $reply) {
                $this->deleteWithReplies($reply);
            }
        }

        $review->delete();
    }

    // Like or dislike a review
    public function likeDislike(Request $request, int $reviewId)
    {
        $user = Auth::user();
        $action = $request->input('action');
        Log::info('Like/dislike action', ['user_id' => $user?->id, 'review_id' => $reviewId, 'action' => $action]);

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

            Log::info('Review updated with like/dislike', ['review_id' => $review->id]);
            return response()->json(['message' => 'Review updated successfully', 'review' => $review], 200);
        } catch (\Exception $e) {
            Log::error('Failed to like/dislike review', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update review'], 500);
        }
    }
}
