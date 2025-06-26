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
            'label' => 'Home',
            'address' => '123 Baker Street',
            'city' => 'London',
            'zip' => 'NW1 6XE',
            'country' => 'UK', // Optional: add country if you want
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
