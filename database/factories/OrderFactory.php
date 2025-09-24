<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Cart;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        return [
            'cart_id' => null,
            'user_id' => null,
            'shipping_status' => 'PRE-TRANSIT',
            'legal_agreement' => true,
            'is_completed' => false,
            'returnable' => true,
            'return_status' => 'UNKNOWN',
            'payment_status' => 'PENDING',
            'orderNote' => $this->faker->sentence(), // now part of order
        ];
    }

    public function forCart(Cart $cart)
    {
        return $this->state(fn() => [
            'cart_id' => $cart->id,
            'user_id' => $cart->user_id,
        ]);
    }
}
