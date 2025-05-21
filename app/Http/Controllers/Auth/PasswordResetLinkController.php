<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Log the incoming request email
        Log::info('Password reset request received for email: ' . $request->email);

        $request->validate([
            'email' => 'required|email',
        ]);

        // Log validation success
        Log::info('Email validated successfully for: ' . $request->email);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Log the outcome of sending the reset link
        Log::info('Password reset link status for email ' . $request->email . ': ' . $status);

        if ($status == Password::RESET_LINK_SENT) {
            // Log the success of the password reset link sent
            Log::info('Password reset link successfully sent to: ' . $request->email);

            return redirect()->route('home')->with('flash.success', 'Password reset link sent!');
        }

        // Log the failure if reset link could not be sent
        Log::error('Failed to send password reset link to: ' . $request->email . ' Status: ' . $status);

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }

}
