<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration form.
     */
    public function create(Request $request)
    {
        $order_id = $request->query('order_id'); // from query params
        $email    = $request->query('email');    // from query params

        Log::info('Rendering registration form', [
            'order_id' => $order_id,
            'email'    => $email,
        ]);

        return Inertia::render('Auth/Register', [
            'order_id' => $order_id,
            'email'    => $email,
            'flash'    => $request->session()->get('flash'),
        ]);
    }


    /**
     * Handle a registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        Log::info('Registration attempt', [
            'ip' => $request->ip(),
            'email' => $request->input('email'),
        ]);

        $existingUser = User::where('email', $request->email)->first();

        Log::info('Existing user lookup result', [
            'exists' => (bool) $existingUser,
            'user' => $existingUser ? $existingUser->only(['id', 'email', 'name']) : null,
        ]);

        if ($existingUser && !is_null($existingUser->password)) {
            Log::info('Account already exists for this email.');
            return back()->withInput()->with('flash.error', 'An account already exists with this email.');
        }

        try {
            $request->validate([
                'email'    => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique(User::class)->ignore($existingUser?->id),
                ],
                'password' => [
                    'nullable',
                    'confirmed',
                    Password::min(6),
                    'regex:/[!@#$%^&*(),.?":{}|<>]/',
                ],
            ], [
                'password.regex' => 'The password must include at least one special character.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed', [
                'errors' => $e->errors(),
                'input'  => $request->all(),
            ]);
            throw $e;
        }

        Log::info('Registration validation passed', [
            'email' => $request->email,
        ]);

        $userData = [
            'email'    => $request->email,
            'password' => $request->filled('password')
                ? Hash::make($request->password)
                : ($existingUser->password ?? null),
        ];

        $user = $existingUser
            ? tap($existingUser)->update($userData)
            : User::create(array_merge($userData, ['name' => $request->name]));

        Log::info('User registered or updated', ['user_id' => $user->id]);

        event(new Registered($user));
        Auth::login($user);

        Log::info('User logged in after registration', ['user_id' => $user->id]);

        return redirect()->route('verification.notice');
    }
}
