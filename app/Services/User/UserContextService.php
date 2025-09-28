<?php

namespace App\Services\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UserContextService
{
    /**
     * Determine the target user id for a request.
     * Admins can specify a user_id; otherwise use their own id.
     */
    public function getTargetUserId(Request $request): ?int
    {
        $user = Auth::user();

        if (!$user) {
            Log::warning('No authenticated user found for target user ID request', [
                'user_id' => $request->input('user_id'),
            ]);
            return null;
        }

        $targetUserId = $user->isAdmin() && $request->input('user_id')
            ? (int) $request->input('user_id')
            : $user->id;

        Log::info('Target user ID determined', [
            'current_user_id' => $user->id,
            'target_user_id' => $targetUserId,
            'is_admin' => $user->isAdmin(),
        ]);

        return $targetUserId;
    }

    /**
     * Ensure that there is an authenticated user.
     * Throws a 403 JSON response if guest.
     */
    public function ensureAuthenticated(): Authenticatable
    {
        $user = Auth::user();

        if (!$user) {
            Log::warning('Unauthorized access attempt by guest user');
            abort(response()->json(['message' => 'Guests cannot perform this action.'], 403));
        }

        Log::info('Authenticated user found', [
            'user_id' => $user->id,
            'user_email' => $user->email,
        ]);

        return $user;
    }
}
