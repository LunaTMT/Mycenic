<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Question;

class QuestionsSeeder extends Seeder
{
    /**
     * Questions data referencing users by user_id.
     * Make sure users exist with these IDs before running this seeder.
     */
    protected array $questionsData = [
        [
            'user_id' => 2,  // Emily Carter (assuming this is ID 2)
            'question' => 'How long does it take for Golden Teacher spores to germinate?',
            'date' => '2024-07-01 10:00:00',
            'is_admin' => false,
            'likes' => 12,
            'dislikes' => 1,
            'replies' => [
                [
                    'user_id' => 1, // Admin user (ID 1)
                    'question' => 'Typically, germination starts within 24-72 hours under optimal conditions.',
                    'date' => '2024-07-01 11:00:00',
                    'is_admin' => true,
                    'likes' => 8,
                    'dislikes' => 0,
                ],
                [
                    'user_id' => 3, // MushroomLover99 (ID 3)
                    'question' => 'I have seen it take up to 5 days in some cases.',
                    'date' => '2024-07-01 12:30:00',
                    'is_admin' => false,
                    'likes' => 4,
                    'dislikes' => 1,
                ],
                [
                    'user_id' => 1, // Admin user again
                    'question' => 'Maintaining humidity and temperature will speed things up.',
                    'date' => '2024-07-01 13:00:00',
                    'is_admin' => true,
                    'likes' => 10,
                    'dislikes' => 0,
                ],
                [
                    'user_id' => 5, // SporeCollector (assuming ID 5)
                    'question' => 'Using fresh spores also makes a big difference.',
                    'date' => '2024-07-01 14:15:00',
                    'is_admin' => false,
                    'likes' => 6,
                    'dislikes' => 0,
                ],
            ],
        ],
        // You can add more questions with replies here similarly
    ];

    public function run()
    {
        foreach ($this->questionsData as $questionData) {
            $user = User::find($questionData['user_id']);
            if (!$user) {
                Log::error("User not found for question user_id: {$questionData['user_id']}");
                continue;
            }

            $question = Question::create([
                'user_id' => $user->id,
                'question' => $questionData['question'],
                'date' => $questionData['date'],
                'is_admin' => $questionData['is_admin'],
                'likes' => $questionData['likes'],
                'dislikes' => $questionData['dislikes'],
                'parent_id' => null,
            ]);

            foreach ($questionData['replies'] as $replyData) {
                $replyUser = User::find($replyData['user_id']);
                if (!$replyUser) {
                    Log::error("User not found for reply user_id: {$replyData['user_id']}");
                    continue;
                }

                Question::create([
                    'user_id' => $replyUser->id,
                    'question' => $replyData['question'],
                    'date' => $replyData['date'],
                    'is_admin' => $replyData['is_admin'],
                    'likes' => $replyData['likes'],
                    'dislikes' => $replyData['dislikes'],
                    'parent_id' => $question->id,
                ]);
            }

            Log::info("Seeded question and replies for user ID {$questionData['user_id']}");
        }
    }
}
