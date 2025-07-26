<?php

namespace Database\Factories;

use App\Models\Reply;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;

class ReplyFactory extends Factory
{
    protected $model = Reply::class;

    public function definition()
    {
        return [
            'content' => $this->faker->sentence,
            'user_id' => User::inRandomOrder()->first()?->id,
            'likes' => $this->faker->numberBetween(0, 50),
            'dislikes' => $this->faker->numberBetween(0, 50),
        ];
    }

    public function forReplyable(Model $model)
    {
        return $this->state(function () use ($model) {
            return [
                'replyable_type' => get_class($model),
                'replyable_id' => $model->id,
            ];
        });
    }
}
