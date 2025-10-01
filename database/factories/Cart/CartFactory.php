<?php

namespace Database\Factories\Cart;

use App\Models\Cart\Cart;
use App\Models\User\User;
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
            'shipping_cost' => 0,
            'status' => 'active',
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
