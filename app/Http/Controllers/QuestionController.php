<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    // Recursively load questions with replies and users
    public function getQuestionsWithReplies()
    {
        Log::info('Fetching questions with replies started.');

        try {
            $questions = Question::with([
                    'user',
                    'repliesRecursive.user'
                ])
                ->whereNull('parent_id')  
                ->orderBy('date', 'desc')
                ->get();

            Log::info('Fetching questions with replies succeeded.', ['count' => $questions->count()]);

            return response()->json($questions);
        } catch (\Exception $e) {
            Log::error('Error fetching questions with replies: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch questions'], 500);
        }
    }

    // Store a reply to a question by ID
    public function storeReply(Request $request, $id)
    {
        Log::info('storeReply called.', ['question_id' => $id, 'payload' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'question' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed for reply submission.', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user();

            if (!$user) {
                Log::warning('Unauthorized reply submission attempt.');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $reply = new Question([
                'user_id' => $user->id,
                'question' => $request->question,
                'date' => now(),
                'is_admin' => $user->isAdmin(),
                'parent_id' => $id,
            ]);

            $reply->save();

            Log::info('Reply saved successfully.', ['reply_id' => $reply->id]);

            return response()->json($reply, 201);
        } catch (\Exception $e) {
            Log::error('Error saving reply.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Reply failed to save'], 500);
        }
    }

    // Update question text (admins can update any question, others only own and within 10 mins)
    public function update(Request $request, Question $question)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Admin can update any question; user only their own
        if (!$user->isAdmin() && $question->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only enforce 10-minute window for non-admins
        if (!$user->isAdmin() && $question->created_at->diffInMinutes(now()) > 10) {
            return response()->json(['error' => 'Edit window expired.'], 403);
        }

        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        try {
            $question->question = $request->input('question');
            $question->save();

            Log::info('Question updated successfully', [
                'question_id' => $question->id,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Question updated successfully.',
                'question' => $question,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating question.', [
                'question_id' => $question->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to update question.'], 500);
        }
    }

    // Store a new root question
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'question' => 'required|string|max:300',
            'category' => 'required|string|max:255',
        ]);

        $question = new Question([
            'user_id' => $user->id,
            'question' => $validated['question'],
            'category' => $validated['category'], // ✅ Make sure this line is included
            'date' => now(),
            'is_admin' => $user->isAdmin(),
            'parent_id' => null,
        ]);

        $question->save();

        return response()->json([
            'message' => 'Question created successfully.',
            'question' => $question,
        ], 201);
    }


    // Hard delete question; reassign replies to parent; admins can delete any question, users only their own
    public function destroy($id)
    {
        try {
            $question = Question::findOrFail($id);
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            if (!$user->isAdmin() && $question->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            if ($question->parent_id === null) {
                // Top-level question: delete it and all nested replies
                $this->deleteWithReplies($question);
            } else {
                // Reply: reassign its replies to its own parent
                Question::where('parent_id', $question->id)
                    ->update(['parent_id' => $question->parent_id]);

                $question->delete();
            }

            return response()->json(['message' => 'Question deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Failed to delete question', [
                'error' => $e->getMessage(),
                'question_id' => $id,
            ]);

            return response()->json(['error' => 'Server error'], 500);
        }
    }


    protected function deleteWithReplies(Question $question)
    {
        foreach ($question->repliesRecursive as $reply) {
            $this->deleteWithReplies($reply);
        }

        $question->delete();
    }

}
