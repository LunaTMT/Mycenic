<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition()
    {
        $item = Item::inRandomOrder()->first();
        
        $selectedOptions = [];

        if ($item && !empty($item->options) && is_array($item->options)) {
            foreach ($item->options as $key => $values) {
                if (!empty($values) && is_array($values)) {
                    // Pick one random value per option
                    $selectedOptions[$key] = $this->faker->randomElement($values);
                }
            }
        }


        return [
            'cart_id' => Cart::factory(),
            'item_id' => $item ? $item->id : null,
            'quantity' => $this->faker->numberBetween(1, 5),
            'selected_options' => $selectedOptions,
        ];
    }
}
