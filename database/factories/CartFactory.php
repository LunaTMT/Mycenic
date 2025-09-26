<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id ?? null,
            'subtotal' => 0,
            'total' => 0,
            'discount' => 0,
            'shipping_cost' => 0,
            'status' => 'active', // default, can override in seeder
        ];
    }

    public function checkedOut()
    {
        return $this->state(fn () => [
            'status' => 'checked_out',
            'updated_at' => now(),
        ]);
    }
}
