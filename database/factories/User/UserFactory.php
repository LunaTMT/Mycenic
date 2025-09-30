<?php

namespace Database\Factories\User;

use App\Models\User\User;
use App\Models\User\Address;  // Updated from ShippingDetail to Address
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

    // Unverified user state
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    // Custom role state
    public function withRole(string $role): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => $role,
        ]);
    }

    // Configure method to create addresses and avatar
    public function configure()
    {
        return $this->afterCreating(function (User $user) {
            Log::info("Creating addresses for User ID {$user->id} ({$user->email})");

            // Create avatar for the user
            $unsplash = new UnsplashService();
            $avatarUrl = $unsplash->getRandomMushroomImage() ?? 'https://i.pravatar.cc/150?img=12';

            // Create polymorphic avatar image
            $user->avatar()->create([
                'path' => $avatarUrl,
            ]);

            // Create at least one address, with one being set as default
            $addresses = Address::factory()->count(rand(1, 3))->create([
                'user_id' => $user->id,
                'country' => 'United Kingdom',
            ]);

            // Ensure the first address is set as default
            $addresses->first()->update(['is_default' => true]);

            Log::info("Created {$addresses->count()} addresses for User ID {$user->id}");
        });
    }
}
