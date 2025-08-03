<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Review;
use App\Models\Image;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        Item::factory()
            ->count(5)
            ->create()
            ->each(function (Item $item) {
                // Generate between 1 and 8 images for each item
                Image::factory()
                    ->count(rand(1, 8))
                    ->create([
                        'imageable_id' => $item->id,
                        'imageable_type' => Item::class,
                    ]);

                // Create random number of reviews per item
                $randomReviewCount = rand(1, 7);

                $reviews = Review::factory()
                    ->count($randomReviewCount)
                    ->withReplies()
                    ->create(['item_id' => $item->id]);

                // Attach images ONLY to top-level reviews
                $reviews->filter(fn ($review) => $review->parent_id === null)
                    ->each(function ($review) {
                        Image::factory()
                            ->count(rand(1, 5))
                            ->make()  // Use make() so morph keys are set by relation save()
                            ->each(fn ($image) => $review->images()->save($image));
                    });
            });
    }
}
