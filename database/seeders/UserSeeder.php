<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User\User;
use App\Models\User\Address;
use Illuminate\Support\Facades\Hash;
use App\Services\UnsplashService;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // --- Admin user ---
        $admin = User::create([
            'name' => 'Mycenic',
            'email' => 'mycenic@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $unsplashService = new UnsplashService();
        $admin->avatar()->create([
            'path' => $unsplashService->getRandomMushroomImage() ?? 'https://i.pravatar.cc/150?img=12',
        ]);

        // Create 3 addresses for admin with none default initially
        $addresses = Address::factory(3)->create([
            'user_id' => $admin->id,
            'is_default' => false,
        ]);

        // Set the first address as default
        $addresses->first()->update(['is_default' => true]);

        // --- Non-admin user (Taylor) ---
        $taylor = User::create([
            'name' => 'Taylor Threader',
            'email' => 'taylorthreader@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'user', // assuming you have roles
        ]);

        $taylor->avatar()->create([
            'path' => $unsplashService->getRandomMushroomImage() ?? 'https://i.pravatar.cc/150?img=15',
        ]);

        Address::factory(rand(1, 2))->create([
            'user_id' => $taylor->id,
            'is_default' => true,
        ]);

        // --- 5 random other users ---
        User::factory(5)->create()->each(function ($user) {
            Address::factory(rand(1, 3))->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
