<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User\User;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Cart\Promotion;
use App\Models\Item;

class CartSeeder extends Seeder
{
    public function run(): void
    {
        $items = Item::all();

        if ($items->isEmpty()) {
            $this->command->warn('No items found. Please seed items first.');
            return;
        }

        User::all()->each(function ($user) use ($items) {
            // Active Cart
            $activeCart = Cart::factory()->for($user)->create(['status' => 'active']);
            $this->fillCartWithItems($activeCart, $items);
            $this->maybeAttachPromotion($activeCart);

            // Checked-out Cart
            $checkedOutCart = Cart::factory()->for($user)->checkedOut()->create();
            $this->fillCartWithItems($checkedOutCart, $items);
            $this->maybeAttachPromotion($checkedOutCart);
        });
    }

    private function fillCartWithItems(Cart $cart, $items): void
    {
        $randomItems = $items->shuffle()->take(rand(1, 4));

        foreach ($randomItems as $item) {
            $selectedOptions = [];

            if (is_array($item->options) && count($item->options) > 0) {
                foreach ($item->options as $key => $values) {
                    $selectedOptions[$key] = fake()->randomElement($values);
                }
            }

            CartItem::factory()->create([
                'cart_id' => $cart->id,
                'item_id' => $item->id,
                'selected_options' => $selectedOptions,
            ]);
        }

        $cart->recalculateTotals();
    }

    private function maybeAttachPromotion(Cart $cart): void
    {
        if (rand(1, 100) <= 75) { // 75% chance
            $promotion = Promotion::factory()->create();
            $cart->promotion_id = $promotion->id;
            $cart->recalculateTotals();
        }
    }
}
