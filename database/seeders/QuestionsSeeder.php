<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;

class QuestionsSeeder extends Seeder
{
    public function run()
    {
        // Create 5 parent questions
        $parentQuestions = Question::factory(5)->create();

        foreach ($parentQuestions as $parentQuestion) {
            // Create 2 replies for each parent question
            $replies = Question::factory(2)->create([
                'parent_id' => $parentQuestion->id,
            ]);

            foreach ($replies as $reply) {
                // Create 1 nested reply for each reply (grandchild)
                Question::factory(1)->create([
                    'parent_id' => $reply->id,
                ]);
            }
        }
    }
}
