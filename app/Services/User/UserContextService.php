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
        return Auth::user() ?: User::guest();
    }

    /**
     * Return the target user based on admin override or current user.
     * Automatically falls back to guest if user not found or permission denied.
     */
    public function getTargetUser(Request $request): User
    {
        $currentUser = $this->getUser();
        $targetUserId = ($currentUser->isAdmin() && $request->input('user_id'))
            ? (int) $request->input('user_id')
            : $currentUser->id;

        $user = User::find($targetUserId) ?: User::guest();

        // Permission check only for real users
        if (!$user->isGuest && !$currentUser->can('view', $user)) {
            Log::warning('Unauthorized access attempt', [
                'current_user_id' => $currentUser->id,
                'target_user_id' => $user->id,
            ]);
            $user = User::guest();
        }

        Log::info('Target user resolved', [
            'current_user_id' => $currentUser->id,
            'target_user_id' => $user->id,
            'is_guest' => $user->isGuest,
        ]);

        return $user;
    }
}
