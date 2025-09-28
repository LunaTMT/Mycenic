<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
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

    /**
     * Return user data as JSON.
     */
    public function index(Request $request)
    {
        Log::info("usercontr index");
        // Ensure user is authenticated
        $currentUser = $this->userContextService->ensureAuthenticated();

        Log::info('UserController@index called', [
            'current_user_id' => $currentUser->id,
            'is_admin' => $currentUser->isAdmin(),
            'requested_user_id' => $request->query('user_id'),
        ]);

        // Determine which user data to fetch (current user or another user if admin)
        $userId = $this->userContextService->getTargetUserId($request);
        $user = User::with('addresses', 'avatar')->find($userId);

        if (!$user) {
            Log::warning('Requested user not found', ['user_id' => $userId]);
            return response()->json(['message' => 'User not found'], 404);
        }

        // Check permissions using UserPolicy
        if ($currentUser->can('view', $user)) {
            Log::info('User details fetched successfully', ['user_id' => $user->id]);

            return response()->json([
                'user' => $user,
                'isAdmin' => $currentUser->isAdmin(),
            ]);
        } else {
            Log::warning('Unauthorized access attempt', [
                'current_user_id' => $currentUser->id,
                'target_user_id' => $user->id,
            ]);

            return response()->json(['message' => 'Unauthorized'], 403);
        }
    }
}
