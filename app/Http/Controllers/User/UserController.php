<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use App\Services\User\UserContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    protected UserContextService $userContextService;

    public function __construct(UserContextService $userContextService)
    {
        $this->userContextService = $userContextService;
    }

    // Return all users
    public function index()
    {
        $users = User::all(); // optionally use pagination for large datasets
        return response()->json(['users' => $users]);
    }

    // Return the target user (current user or based on request)
    public function show(Request $request)
    {
        Log::info("Showing target user");
        $user = $this->userContextService->getTargetUser($request);
        return response()->json(['user' => $user]);
    }
}
