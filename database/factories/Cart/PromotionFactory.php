<?php

namespace Database\Factories\Cart;

use App\Models\Cart\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'discount' => $this->faker->numberBetween(5, 50), // 5%–50%
            'expires_at' => $this->faker->optional()->dateTimeBetween('now', '+6 months'),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->subDays(rand(1, 30)),
        ]);
    }
}
