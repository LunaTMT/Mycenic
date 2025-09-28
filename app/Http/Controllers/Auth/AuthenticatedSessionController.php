<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redirect;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        // You can log or handle session flash data here if needed
        return Inertia::render('Auth/Login/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'flash' => $request->session()->get('flash'),
        ]);
    }
    public function store(LoginRequest $request): RedirectResponse
    {
        // Recaptcha validation logic here (if you use it)
        Log::info("store");
        $recaptcha = $request->input('g-recaptcha-response');
        $secret = env('VITE_NOCAPTCHA_SECRET');

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $recaptcha,
        ]);

        $data = $response->json();

        if (!$data['success'] || ($data['score'] ?? 0) < 0.5) {
            return back()->withErrors(['captcha' => 'CAPTCHA validation failed.']);
        }

        // Authenticate the user
        $request->authenticate();
        $request->session()->regenerate();

        // Use the redirect parameter from the request, or fallback to home
        $redirectUrl = $request->input('redirect', route('home'));

        return redirect()->intended($redirectUrl)->with('flash.success', 'Login successful.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();


        // Use the redirect parameter from the request, or fallback to home
        $redirectUrl = $request->input('redirect', route('home'));

        return redirect()->intended($redirectUrl)->with('flash.success', 'Logout successful.');
    }
}
