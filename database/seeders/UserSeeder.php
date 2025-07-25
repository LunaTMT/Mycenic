<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Services\UnsplashService;

class UserSeeder extends Seeder
{
    public function run()
    {
        $unsplashService = new UnsplashService();

        // Create admin user with a specific avatar and fixed address
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'avatar' => $unsplashService->getRandomMushroomImage() ?? 'https://i.pravatar.cc/150?img=12',
        ]);

        DB::table('addresses')->insert([
            'user_id' => $admin->id,
            'address' => '123 Baker Street',
            'city' => 'London',
            'zip' => 'NW1 6XE',
            'country' => 'UK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create 20 random users using factory - each with 1 to 3 addresses (configured in factory)
        User::factory(20)->create();
    }
}
