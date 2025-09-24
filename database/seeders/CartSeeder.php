<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Item;

class CartSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $items = Item::all();

        if ($users->isEmpty() || $items->isEmpty()) {
            $this->command->warn('No users or items found. Skipping CartSeeder.');
            return;
        }

        foreach ($users as $user) {
            // Create one active cart per user
            $cart = Cart::factory()->create([
                'user_id' => $user->id,
                'status' => 'active',
            ]);

            // Pick 2–5 random items for this cart (but not more than exist)
            $max = min(5, $items->count());
            $chosenItems = $items->random(rand(2, $max));


            foreach ($chosenItems as $item) {
                $quantity = rand(1, 3);

                CartItem::factory()->create([
                    'cart_id' => $cart->id,
                    'item_id' => $item->id,
                    'quantity' => $quantity,
                ]);

                // Update totals
                $cart->subtotal += $item->price * $quantity;
                $cart->total = $cart->subtotal; // adjust later if shipping/discount needed
            }

            $cart->save();
        }
    }
}
