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

        // Create admin user
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

        $usersData = [
            [
                'name' => 'Emily Carter',
                'email' => 'emily.carter@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '789 Forest Lane',
                    'city' => 'Bristol',
                    'zip' => 'BS1 4ST',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'MushroomLover99',
                'email' => 'mlover99@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '1010 Fungus Ave',
                    'city' => 'Glasgow',
                    'zip' => 'G1 2XY',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'SporeCollector',
                'email' => 'spore.collector@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '222 Mycology St',
                    'city' => 'Leeds',
                    'zip' => 'LS3 1AB',
                    'country' => 'UK',
                ],
            ],

            // New users added here:
            [
                'name' => 'FungiFanatic',
                'email' => 'fungifanatic@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '55 Spore Street',
                    'city' => 'Edinburgh',
                    'zip' => 'EH1 3AB',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'MycoMagic',
                'email' => 'mycomagic@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '101 Shroom Blvd',
                    'city' => 'Cambridge',
                    'zip' => 'CB2 1TN',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'SporeSeeker',
                'email' => 'sporeseeker@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '7 Mushroom Way',
                    'city' => 'Oxford',
                    'zip' => 'OX1 2JD',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'ShroomHunter',
                'email' => 'shroomhunter@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '88 Fungi Drive',
                    'city' => 'Birmingham',
                    'zip' => 'B1 1AA',
                    'country' => 'UK',
                ],
            ],
            [
                'name' => 'MushroomExplorer',
                'email' => 'mushroomexplorer@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'address' => [
                    'address' => '12 Cap Street',
                    'city' => 'Liverpool',
                    'zip' => 'L1 8JQ',
                    'country' => 'UK',
                ],
            ],
        ];

        foreach ($usersData as $userData) {
            $avatarUrl = $unsplashService->getRandomMushroomImage();

            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                'role' => $userData['role'],
                'avatar' => $avatarUrl ?? null,
            ]);

            DB::table('addresses')->insert([
                'user_id' => $user->id,
                'address' => $userData['address']['address'],
                'city' => $userData['address']['city'],
                'zip' => $userData['address']['zip'],
                'country' => $userData['address']['country'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
