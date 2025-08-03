<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;
use App\Services\UnsplashService;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $unsplashService = new UnsplashService(); // if used later

        // Admin user with fixed address
        $admin = User::create([
            'name' => 'Mycenic',
            'email' => 'mycenic@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'avatar' => 'assets/avatars/admin_logo.png',
        ]);

        Address::factory()->create([
            'user_id' => $admin->id,
            'name' => 'Admin Home',
            'address' => '123 Baker Street',
            'city' => 'London',
            'zip' => 'NW1 6XE',
        ]);

        // 5 users with 1–3 random addresses each
        User::factory(5)->create()->each(function ($user) {
            Address::factory(rand(1, 3))->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
