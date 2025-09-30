<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\User\UserController;

Route::get('/user', [UserController::class, 'show'])->name('user.show');