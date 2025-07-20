<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

use App\Models\ReviewImage;
use OpenAI;
use Illuminate\Support\Facades\Storage;
use App\Models\ReviewVote;


class ReviewController extends Controller
{
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

   

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:5000',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        // Initialize OpenAI client
        $client = OpenAI::client(env('OPENAI_API_KEY'));

        // Run moderation check
        $moderation = $client->moderations()->create([
            'input' => $request->input('content'),
        ]);

        $result = $moderation->results[0];

        // Log the full moderation response
        Log::info('OpenAI Moderation Response:', [
            'input' => $request->input('content'),
            'result' => $result,
        ]);

        if ($result->flagged) {
            return response()->json([
                'message' => 'Your content was flagged as inappropriate.',
                'categories' => $result->categories,
                'scores' => $result->categoryScores,
            ], 422);
        }

        // If passed, store the review
        $review = Review::create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
            'rating' => $request->input('rating'),
        ]);

        return response()->json([
            'message' => 'Review submitted successfully.',
            'review' => $review,
        ]);
    }

    

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
            $reply->item_id = $parentReview->item_id;
            $reply->likes = 0;
            $reply->dislikes = 0;
            $reply->parent_id = $parentReview->id;
            $reply->rating = 0;
            $reply->save();

            Log::info('Reply submitted successfully', ['reply_id' => $reply->id]);
            return response()->json(['message' => 'Reply submitted successfully', 'review' => $reply], 201);
        } catch (\Exception $e) {
            Log::error('Failed to submit reply', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to submit reply'], 500);
        }
    }
    

    

    public function vote(Request $request, Review $review)
    {
        $vote = $request->input('vote'); // 'like' or 'dislike'
        $user = $request->user();

        // Get guest token from cookie or request input
        $guestToken = $user ? null : ($request->cookie('guest_token') ?? $request->input('guest_token'));

        Log::info('Incoming vote request', [
            'user_id' => $user?->id,
            'guest_token' => $guestToken,
            'vote' => $vote,
            'review_id' => $review->id,
        ]);

        // Validate vote
        if (!in_array($vote, ['like', 'dislike'])) {
            Log::warning('Invalid vote value', ['vote' => $vote]);
            return response()->json(['error' => 'Invalid vote value'], 400);
        }

        if (!$user && !$guestToken) {
            Log::warning('Missing guest token for anonymous vote');
            return response()->json(['error' => 'Missing guest token'], 400);
        }

        Log::info('Checking for existing vote...');
        // Check if user (or guest token) already voted
        $existingVote = $review->votes()
            ->when($user, fn($q) => $q->where('user_id', $user->id))
            ->when(!$user, fn($q) => $q->where('guest_token', $guestToken))
            ->first();

        if ($existingVote) {
            Log::info('Existing vote found', ['existing_vote' => $existingVote->vote]);

            if ($existingVote->vote === $vote) {
                Log::info('Vote is the same as before, removing vote (toggle off)');

                // Update counts
                if ($existingVote->vote === 'like') {
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
                Log::info('Vote changed, updating vote record');

                // Update counts: remove old vote, add new vote
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
            Log::info('No existing vote, creating new vote');

            // Add new vote count
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







    public function update(Request $request, Review $review)
    {
        \Log::info('HIT UPDATE METHOD', ['review_id' => $review->id]);

        // Log raw input data
        \Log::info('Raw Request Data', [
            'all_inputs' => $request->all(),
            'file_keys' => $request->files->keys(),
        ]);

        try {
            $validated = $request->validate([
                'content' => 'required|string|max:300',
                'rating' => 'required|numeric|min:0.5|max:5',
                'deleted_image_ids' => 'sometimes|array',
                'deleted_image_ids.*' => 'integer|exists:review_images,id',
                // Explicitly allow common image MIME types:
                'images' => 'sometimes|array',
                'images.*' => 'mimes:jpeg,jpg,png,bmp,gif,svg,webp|max:2048',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', $e->errors());
            throw $e;
        }

        \Log::info('Validated data received for update', [
            'review_id' => $review->id,
            'content' => $validated['content'],
            'rating' => $validated['rating'],
            'deleted_image_ids' => $validated['deleted_image_ids'] ?? [],
            'new_images_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
        ]);

        // Update review content and rating
        $review->content = $validated['content'];
        $review->rating = $validated['rating'];
        $review->save();

        // Delete images marked for deletion
        if (!empty($validated['deleted_image_ids'])) {
            foreach ($validated['deleted_image_ids'] as $imageId) {
                $image = $review->images()->find($imageId);
                if ($image) {
                    \Log::info('Deleting review image', [
                        'image_id' => $image->id,
                        'image_path' => $image->image_path,
                    ]);
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                } else {
                    \Log::warning('Attempted to delete non-existing image', ['image_id' => $imageId]);
                }
            }
        }

        // Store new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('review_images', 'public');
                $createdImage = $review->images()->create([
                    'image_path' => $path,
                ]);
                \Log::info('Added new review image', [
                    'image_id' => $createdImage->id,
                    'image_path' => $path,
                ]);
            }
        }

        // Reload review images after changes
        $review->load('images');

        \Log::info('Review update completed successfully', ['review_id' => $review->id]);

        return response()->json([
            'message' => 'Review updated successfully',
            'review' => $review->load(['user', 'images', 'repliesRecursive']),
        ]);
    }


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
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($review->parent_id === null) {
                $this->deleteWithReplies($review);
            } else {
                Review::where('parent_id', $review->id)->update(['parent_id' => $review->parent_id]);
                $review->delete();
            }

            Log::info('Review deleted successfully', ['review_id' => $reviewId]);
            return response()->json(['message' => 'Review deleted successfully.'], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete review', ['error' => $e->getMessage(), 'review_id' => $reviewId]);
            return response()->json(['error' => 'Failed to delete review'], 500);
        }
    }

    protected function deleteWithReplies(Review $review)
    {
        foreach ($review->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        foreach ($review->replies as $reply) {
            $this->deleteWithReplies($reply);
        }

        $review->delete();
    }

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
                return response()->json(['error' => 'Invalid action'], 400);
            }

            $review->save();

            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $review
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update review'], 500);
        }
    }

    /**
     * GET /reviews/{id}
     * Returns a single review with images, user, and replies
     */
    public function show($id)
    {
        $review = Review::with(['user', 'images', 'repliesRecursive'])->findOrFail($id);
        return response()->json($review);
    }
}
