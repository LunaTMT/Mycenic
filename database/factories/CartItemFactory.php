<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'item_id' => Item::factory(), // fallback if not provided
            'quantity' => $this->faker->numberBetween(1, 3),
            'selected_options' => null,
        ];
    }
}
