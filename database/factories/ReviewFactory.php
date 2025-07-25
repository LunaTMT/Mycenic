<?php

// database/factories/ReviewFactory.php

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
            'user_id' => User::inRandomOrder()->first()->id,
            'content' => $this->faker->paragraph,
            'likes' => $this->faker->numberBetween(0, 100),
            'dislikes' => $this->faker->numberBetween(0, 100),
            'parent_id' => null,
            'rating' => $this->faker->randomFloat(1, 1, 5),
            'item_id' => Item::inRandomOrder()->first()->id,
        ];
    }

    public function withReplies(int $count = 3)
    {
        return $this->afterCreating(function (Review $review) use ($count) {
            Reply::factory()
                ->count($count)
                ->for($review, 'replyable')
                ->create();

      
            Reply::factory()
                ->count(2)
                ->create([
                    'replyable_type' => Reply::class,
                    'replyable_id' => $review->replies()->inRandomOrder()->first()?->id,
                ]);
        });
    }
}
