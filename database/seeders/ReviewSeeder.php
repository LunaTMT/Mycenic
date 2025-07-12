<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run()
    {
        // Create 5 parent reviews (top-level, parent_id = null)
        $parentReviews = Review::factory(5)->create();

        foreach ($parentReviews as $parentReview) {
            // Only top-level reviews get images (50% chance)
            if (rand(0, 1) === 1) {
                $imageCount = rand(1, 5); // max 5 images
                ReviewImage::factory($imageCount)->create(['review_id' => $parentReview->id]);
            }

            // Create 2 replies per parent review (no images for replies)
            $replies = Review::factory(2)->create(['parent_id' => $parentReview->id]);

            foreach ($replies as $reply) {
                // No images for replies or nested replies

                // Create 1 nested reply per reply
                Review::factory()->create(['parent_id' => $reply->id]);
            }
        }
    }
}
