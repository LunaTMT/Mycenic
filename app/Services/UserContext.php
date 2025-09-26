<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UserContext
{
    /**
     * Determine the target user id for a request.
     * Admins can specify a user_id; otherwise use their own id.
     */
    public function getTargetUserId(Request $request): ?int
    {
        $user = Auth::user();
        if (!$user) return null;

        return $user->isAdmin() && $request->input('user_id')
            ? (int) $request->input('user_id')
            : $user->id;
    }

    /**
     * Ensure that there is an authenticated user.
     * Throws a 403 JSON response if guest.
     */
    public function ensureAuthenticated(): Authenticatable
    {
        $user = Auth::user();
        if (!$user) {
            abort(response()->json(['message' => 'Guests cannot perform this action.'], 403));
        }
        return $user;
    }
}
