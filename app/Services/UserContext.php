<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UserContext
{
    /**
     * Get the currently authenticated user, or null if guest.
     */
    public function getAuthUser(): ?Authenticatable
    {
        return Auth::user();
    }

    /**
     * Determine the target user id for a request.
     * Admins can specify a user_id; otherwise use their own id.
     */
    public function getTargetUserId(Request $request): ?int
    {
        $user = $this->getAuthUser();
        return $user && $user->isAdmin() && $request->input('user_id')
            ? (int) $request->input('user_id')
            : optional($user)->id;
    }

    /**
     * Ensure that there is an authenticated user.
     * Throws a 403 JSON response if guest.
     */
    public function ensureAuthenticated(): Authenticatable
    {
        $user = $this->getAuthUser();
        if (!$user) {
            abort(response()->json(['message' => 'Guests cannot perform this action.'], 403));
        }
        return $user;
    }
}
