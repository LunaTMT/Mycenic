<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User\User;
use App\Models\Order;
use App\Models\Cart\Cart;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $carts = Cart::where('user_id', $user->id)->get();

            foreach ($carts as $cart) {
                if ($cart->items()->count() > 0) {
                    Order::factory()->forCart($cart)->create();
                }
            }
        }
    }
}
