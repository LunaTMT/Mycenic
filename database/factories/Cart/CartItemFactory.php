<?php

namespace Database\Factories\Cart;

use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition()
    {
        // Pick a random item
        $item = Item::inRandomOrder()->first();

        $selectedOptions = [];

        if ($item && is_array($item->options) && count($item->options) > 0) {
            foreach ($item->options as $optionName => $values) {
                $selectedOptions[$optionName] = $this->faker->randomElement($values);
            }
        }

        return [
            'cart_id' => Cart::factory(),
            'item_id' => $item?->id,
            'quantity' => $this->faker->numberBetween(1, 5),
            'selected_options' => $selectedOptions, // empty if no options
        ];
    }
}
