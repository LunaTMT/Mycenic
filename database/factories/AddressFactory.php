<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // Associate address with a user
            'country' => 'United Kingdom',
            'full_name' => $this->faker->name,
            'phone' => $this->faker->phoneNumber,
            'zip' => $this->faker->postcode,
            'address_line1' => $this->faker->streetAddress,
            'address_line2' => $this->faker->optional()->secondaryAddress,
            'city' => $this->faker->city,
            'state' => $this->faker->state,
            'is_default' => $this->faker->boolean(10), // 10% chance to be default
        ];
    }
}
