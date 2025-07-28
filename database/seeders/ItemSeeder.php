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

        // Ensure users exist
        if (User::count() === 0) {
            User::factory()->count(10)->create();
        }

        // Create items
        Item::factory()->count(1)->create()->each(function (Item $item) {
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

            // Create exactly 2 top-level reviews with replies depth 2
            Review::factory()
                ->count(2)
                ->withReplies(2, 2) // 2 replies per review, 2 levels deep
                ->create(['item_id' => $item->id])
                ->each(function (Review $review) {
                    // Attach 1-5 images to each review
                    ReviewImage::factory()
                        ->count(rand(1, 5))
                        ->create(['review_id' => $review->id]);
                });
        });
    }
}
