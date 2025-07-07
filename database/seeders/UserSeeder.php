<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user without address fields
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Insert address(es) for admin user into addresses table
        DB::table('addresses')->insert([
            'user_id' => $admin->id,
            'address' => '123 Baker Street',
            'city' => 'London',
            'zip' => 'NW1 6XE',
            'country' => 'UK', // Optional: add country if you want
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create non-admin user Taylor Threader
        $user = User::create([
            'name' => 'Taylor Threader',
            'email' => 'taylorthreader@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'user', // default role, could omit since 'user' is default
        ]);

        // (Optional) Insert address(es) for non-admin user
        DB::table('addresses')->insert([
            'user_id' => $user->id,
            'address' => '456 Example Road',
            'city' => 'Manchester',
            'zip' => 'M1 2AB',
            'country' => 'UK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
