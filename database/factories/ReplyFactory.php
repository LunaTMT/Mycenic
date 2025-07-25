<?php
// database/factories/ReplyFactory.php

namespace Database\Factories;

use App\Models\Reply;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReplyFactory extends Factory
{
    protected $model = Reply::class;

    public function definition()
    {
        return [
            'content' => $this->faker->sentence,
            'user_id' => User::inRandomOrder()->first()->id,
            'likes' => $this->faker->numberBetween(0, 100),
            'dislikes' => $this->faker->numberBetween(0, 100),
            'replyable_type' => null, // Will be filled later
            'replyable_id' => null,   // Will be filled later
        ];
    }
}
