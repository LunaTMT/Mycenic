<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        User::all()->each(function ($user) {
            Order::factory(rand(1, 2))->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
