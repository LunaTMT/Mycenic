<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        // Adjust count as needed
        Item::factory()
            ->count(1)
            ->create()
            ->each(function (Item $item) {
                // Create 2 top-level reviews per item, each with nested replies
                $reviews = Review::factory()
                    ->count(2)
                    ->withReplies(2, 2) // 2 replies per review, with 2 nested replies each
                    ->create(['item_id' => $item->id]);

                // Attach images ONLY to top-level reviews
                $reviews->filter(fn ($review) => $review->parent_id === null)
                    ->each(function (Review $review) {
                        ReviewImage::factory()
                            ->count(rand(1, 5))
                            ->create(['review_id' => $review->id]);
                    });
            });
    }
}
