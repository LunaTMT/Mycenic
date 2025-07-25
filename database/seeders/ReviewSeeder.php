<?php


namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class ReviewSeeder extends Seeder
{
    public function run()
    {
        Log::info('Starting ReviewSeeder...');

        // Create 5 top-level parent reviews
        $parentReviews = Review::factory()
            ->count(5)
            ->create();

        Log::info("Created {$parentReviews->count()} parent reviews.");

        foreach ($parentReviews as $parent) {
            // 50% chance of attaching 1–5 images to top-level review
            if (rand(0, 1)) {
                $imageCount = rand(1, 5);
                ReviewImage::factory()
                    ->count($imageCount)
                    ->create(['review_id' => $parent->id]);

                Log::info("Added {$imageCount} images to review ID {$parent->id}.");
            }

            // Create 2 direct replies
            $replies = Review::factory()
                ->count(2)
                ->create([
                    'parent_id' => $parent->id,
                    'item_id' => $parent->item_id,
                ]);

            Log::info("Created 2 replies for review ID {$parent->id}.");

            foreach ($replies as $reply) {
                // Create 1 nested reply per reply
                $nestedReply = Review::factory()->create([
                    'parent_id' => $reply->id,
                    'item_id' => $reply->item_id,
                ]);

                Log::info("Created nested reply ID {$nestedReply->id} for reply ID {$reply->id}.");

                // Optional: create another level of reply
                if (rand(0, 1)) {
                    $secondNested = Review::factory()->create([
                        'parent_id' => $nestedReply->id,
                        'item_id' => $nestedReply->item_id,
                    ]);
                    Log::info("Created second nested reply ID {$secondNested->id} for nested reply ID {$nestedReply->id}.");
                }
            }
        }

        Log::info('ReviewSeeder completed.');
    }
}
