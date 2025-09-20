<?php

// database/seeders/PromoCodeSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PromoCode;

class PromoCodeSeeder extends Seeder
{
    public function run()
    {
        // Create a few promo codes with different attributes
        PromoCode::create([
            'code' => 'DISCOUNT10',
            'discount' => 10, // 10% discount
            'expires_at' => now()->addDays(30), // expires in 30 days
        ]);

        PromoCode::create([
            'code' => 'DISCOUNT20',
            'discount' => 20, // 20% discount
            'expires_at' => now()->addDays(60), // expires in 60 days
        ]);

        PromoCode::create([
            'code' => 'FREESHIP',
            'discount' => 0, // free shipping (flat)
            'expires_at' => now()->addDays(15), // expires in 15 days
        ]);

        // You can add more promo codes here...
    }
}
