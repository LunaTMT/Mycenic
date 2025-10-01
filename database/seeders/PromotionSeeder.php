<?php

// database/seeders/PromotionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cart\Promotion;

class PromotionSeeder extends Seeder
{
    public function run()
    {
        // Create a few promotions with different attributes
        Promotion::create([
            'code' => 'DISCOUNT10',
            'discount' => 10, // 10% discount
            'expires_at' => now()->addDays(30), // expires in 30 days
        ]);

        Promotion::create([
            'code' => 'DISCOUNT20',
            'discount' => 20, // 20% discount
            'expires_at' => now()->addDays(60), // expires in 60 days
        ]);

        Promotion::create([
            'code' => 'FREESHIP',
            'discount' => 0, // free shipping (flat)
            'expires_at' => now()->addDays(15), // expires in 15 days
        ]);

        // You can add more promotions here...
    }
}
