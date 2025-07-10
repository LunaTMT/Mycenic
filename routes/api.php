<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;

// Route to get questions with their replies
Route::get('/questions', [QuestionController::class, 'getQuestionsWithReplies']);
