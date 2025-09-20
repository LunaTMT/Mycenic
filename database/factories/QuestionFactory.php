<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(), // ensures user exists
            'question' => $this->faker->sentence,
            'is_admin' => false,
            'likes' => $this->faker->numberBetween(0, 100),
            'dislikes' => $this->faker->numberBetween(0, 10),
            'category' => $this->faker->randomElement(['general', 'shipping', 'product']),
            'parent_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
