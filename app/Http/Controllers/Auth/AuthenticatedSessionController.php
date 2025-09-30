<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\User\CaptchaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected CaptchaService $captcha;

    public function __construct(CaptchaService $captcha)
    {
        $this->captcha = $captcha;
    }

    /**
     * Show login page
     */
    public function create(Request $request): Response
    {
        Log::info("Displaying login page");
        return inertia('Auth/Login');
    }

    /**
     * Handle login request
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $token = $request->input('g-recaptcha-response');

        if (!$this->captcha->isValid($token)) {
            return back()->withErrors(['captcha' => 'CAPTCHA validation failed.']);
        }

        $request->authenticate();
        $request->session()->regenerate();  

        $redirectUrl = $request->input('redirect', route('home'));
        Log::info("login");
        return redirect()->intended($redirectUrl)->with('flash.success', 'Login successful.');
    }

    /**
     * Logout the user
     */
    public function destroy(Request $request): RedirectResponse
    {
        Log::info("logout");
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $redirectUrl = $request->input('redirect', route('home'));

        return redirect()->intended($redirectUrl)->with('flash.success', 'Logout successful.');
    }
}
