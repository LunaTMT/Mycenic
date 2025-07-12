<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\User;
use App\Models\Item;      // <-- Add this import
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'content' => $this->faker->paragraph,
            'category' => $this->faker->word,
            'likes' => $this->faker->numberBetween(0, 100),
            'dislikes' => $this->faker->numberBetween(0, 100),
            'parent_id' => null,
            'rating' => $this->faker->numberBetween(1, 5),
            'item_id' => Item::inRandomOrder()->first()->id,
        ];
    }
}
