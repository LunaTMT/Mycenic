<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\User;
use App\Models\Item;
use App\Models\Reply;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'content' => $this->faker->paragraph,
            'likes' => $this->faker->numberBetween(0, 100),
            'dislikes' => $this->faker->numberBetween(0, 100),
            'rating' => $this->faker->randomFloat(1, 1, 5),
            'item_id' => Item::inRandomOrder()->first()?->id,
        ];
    }

    public function withReplies(int $count = 3)
    {
        return $this->afterCreating(function (Review $review) use ($count) {
            // Top-level replies
            $topLevelReplies = Reply::factory()
                ->count($count)
                ->forReplyable($review)
                ->create();

            // Nested replies to the top-level replies
            foreach ($topLevelReplies as $reply) {
                Reply::factory()
                    ->count(2)
                    ->forReplyable($reply)
                    ->create();
            }
        });
    }
}
