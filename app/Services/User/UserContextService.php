<?php

namespace App\Services\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User\User;

class UserContextService
{
    /**
     * Return the authenticated user or guest.
     */
    public function getUser(): User
    {
        $authUser = Auth::user();
        Log::info('(GET USER) Auth::user() raw value', ['auth_user' => $authUser]);

        $user = $authUser ?: User::guest();

        if ($user->is_guest) {
            Log::info('Returning guest user', ['user' => $user]);
        } else {
            Log::info('Returning authenticated user', [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ]);
        }

        return $user;
    }

    /**
     * Return the target user based on admin override or current user.
     * Automatically falls back to guest if user not found or permission denied.
     */
    public function getTargetUser(Request $request): User
    {   
        $currentUser = $this->getUser();

        // Log the request for debugging
        Log::info('Incoming request to resolve target user', [
            'request_all' => $request->all(),
            'query_params' => $request->query(),
            'current_user_id' => $currentUser->id,
        ]);

        $targetUserId = ($currentUser->isAdmin() && $request->input('user_id'))
            ? (int) $request->input('user_id')
            : $currentUser->id;

        $user = User::find($targetUserId) ?: User::guest();

        // Log if admin is selecting another user
        if ($currentUser->isAdmin() && $request->input('user_id')) {
            Log::info('Admin user selected a different user', [
                'admin_id' => $currentUser->id,
                'selected_user_id' => $user->id,
            ]);
        }

        // Permission check only for real users
        if (!$user->isGuest && !$currentUser->can('view', $user)) {
            Log::warning('Unauthorized access attempt', [
                'current_user_id' => $currentUser->id,
                'target_user_id' => $user->id,
            ]);
            $user = User::guest();
        }

        return $user;
    }

}