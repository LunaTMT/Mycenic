<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // fallback if you just factory() it
            'subtotal' => 0,
            'total' => 0,
            'discount' => null,
            'shipping_cost' => null,
            'status' => 'active',
        ];
    }
}
