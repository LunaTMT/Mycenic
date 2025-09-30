<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\User\User;
use App\Models\Item;
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
            'parent_id' => null,
            'created_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
        ];
    }


    /**
     * Adds one reply and one nested reply to the review.
     */
    public function withReplies()
    {
        return $this->afterCreating(function (Review $review) {
            // First-level reply
            $firstReply = Review::factory()->create([
                'parent_id' => $review->id,
                'item_id' => $review->item_id,
            ]);

            // Second-level reply (nested reply to the first reply)
            Review::factory()->create([
                'parent_id' => $firstReply->id,
                'item_id' => $review->item_id,
            ]);
        });
    }
}
