<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User\User;
use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Cart\PromoCode;
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
            $this->maybeAttachPromoCode($activeCart);

            // Checked-out Cart
            $checkedOutCart = Cart::factory()->for($user)->checkedOut()->create();
            $this->fillCartWithItems($checkedOutCart, $items);
            $this->maybeAttachPromoCode($checkedOutCart);
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

        $cart->subtotal = $cart->items->sum(fn($i) => $i->item->price * $i->quantity);
        $cart->total = $cart->subtotal + $cart->shipping_cost - $cart->discount;
        $cart->save();
    }

    private function maybeAttachPromoCode(Cart $cart): void
    {
        if (rand(1, 100) <= 75) { // 75% chance
            $promo = PromoCode::factory()->create();
            $cart->promo_code_id = $promo->id;
            $cart->discount = $promo->discount;
            $cart->total = $cart->subtotal + $cart->shipping_cost - $cart->discount;
            $cart->save();
        }
    }
}
