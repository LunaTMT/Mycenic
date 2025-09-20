<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ShippingDetail;
use Illuminate\Support\Facades\Hash;
use App\Services\UnsplashService;

class UserSeeder extends Seeder
{
    public function run(): void
    {
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


        // Create 6 shipping details for admin with none default initially
        $details = ShippingDetail::factory(3)->create([
            'user_id' => $admin->id,
            'is_default' => false,
        ]);

        // Set the first shipping detail as default
        $details->first()->update(['is_default' => true]);

        
        // Create 5 other users with 1–3 shipping details each
        User::factory(5)->create()->each(function ($user) {
            ShippingDetail::factory(rand(1, 3))->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
