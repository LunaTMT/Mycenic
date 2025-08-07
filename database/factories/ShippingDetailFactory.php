<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingDetailFactory extends Factory
{
    protected $model = \App\Models\ShippingDetail::class;

    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'address_line1' => $this->faker->streetAddress(),
            'address_line2' => $this->faker->optional()->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->optional()->state(),
            'zip' => $this->faker->postcode(),
            'country' => 'United Kingdom',
            'is_default' => false,
            'delivery_instructions' => $this->faker->optional()->sentence(),
        ];
    }
}
