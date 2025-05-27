<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when not authenticated.
     */
    protected function redirectTo($request): ?string
    {
        // Redirect to login route or return JSON for Inertia
        return $request->expectsJson() ? null : route('login');
    }
}
