<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Review;
use App\Models\User;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;

class ItemSeeder extends Seeder
{
    public function run()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Ensure there are users to assign reviews to
        if (User::count() === 0) {
            \App\Models\User::factory()->count(10)->create();
        }

        // Create 20 items using the factory
        Item::factory()->count(3)->create()->each(function (Item $item) {
            try {
                $product = Product::create([
                    'name' => $item->name,
                    'description' => $item->description,
                ]);

                $price = Price::create([
                    'unit_amount' => intval(round($item->price * 100)),
                    'currency' => 'gbp',
                    'product' => $product->id,
                ]);

                $item->update([
                    'stripe_product_id' => $product->id,
                    'stripe_price_id' => $price->id,
                ]);

                Log::info("Seeded item with Stripe product: {$item->name}");
            } catch (\Exception $e) {
                Log::error("Failed to create Stripe product/price for item {$item->name}: " . $e->getMessage());
            }

            // Create reviews for this item
            Review::factory()
                ->count(rand(1, 5))
                ->withReplies()
                ->create([
                    'item_id' => $item->id,
                ])
                ->each(function (Review $review) {
                    // Attach 1-5 images to each review
                    $imageCount = rand(1, 5);
                    ReviewImage::factory()
                        ->count($imageCount)
                        ->create(['review_id' => $review->id]);
                });
        });
    }
}
