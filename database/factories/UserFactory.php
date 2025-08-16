<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\ShippingDetail;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\UnsplashService;
use Illuminate\Support\Facades\Log;

class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'user',
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function configure()
    {
        return $this->afterCreating(function (User $user) {
            Log::info("Creating shipping details for User ID {$user->id} ({$user->email})");

            $unsplash = new UnsplashService();
            $avatarUrl = $unsplash->getRandomMushroomImage() ?? 'https://i.pravatar.cc/150?img=12';

            // Create polymorphic avatar image
            $user->avatar()->create([
                'path' => $avatarUrl,
            ]);

            $count = rand(1, 3);
            ShippingDetail::factory()->count($count)->create([
                'user_id' => $user->id,
                'country' => 'United Kingdom',
            ]);

            Log::info("Created {$count} shipping details for User ID {$user->id}");
        });
    }
}
