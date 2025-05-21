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
use Illuminate\Validation\ValidationException;


class AuthenticatedSessionController extends Controller
{


    public function create(Request $request): Response
    {
        // Log the incoming request and check if the flash error message exists
        Log::info('Create login request received.', [
            'user' => $request->user(), // Optionally log the current user
            'flash_error' => $request->session()->get('flash.error') // Log the flash message
        ]);
        
        // Get the flash error message from the session
        $flashMessage = $request->session()->get('flash.error');

        
        // Render the Inertia view and pass the necessary props
        return Inertia::render('Auth/Login/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'flash.error' => $flashMessage,  // Pass the flash message to the Inertia view
        ]);

        

    }
    
    

    
    

    public function store(LoginRequest $request): RedirectResponse
    {
        // Validate the captcha token
        Log::info('store function triggered');
    
        $recaptcha = $request->input('g-recaptcha-response');
        $secret = env('VITE_NOCAPTCHA_SECRET');
    
        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $recaptcha,
        ]);
    
        $data = $response->json();
    
        // Log the reCAPTCHA response including score
        Log::info('reCAPTCHA validation response', [
            'captcha_score' => $data['score'] ?? 'N/A',
            'response_data' => $data,
        ]);
    
        if (!$data['success'] || $data['score'] < 0.5) {
            // CAPTCHA validation failed
            Log::warning('Login attempt failed: CAPTCHA validation unsuccessful.', [
                'ip' => $request->ip(),
                'email' => $request->email,
                'captcha_score' => $data['score'] ?? 'N/A',
            ]);
            return back()->withErrors(['captcha' => 'CAPTCHA validation failed.']);
        }
    
        // If CAPTCHA passed, proceed with normal login
        $request->authenticate();
        $request->session()->regenerate();
    
        Log::info('User successfully logged in.', [
            'ip' => $request->ip(),
            'user_id' => $request->user()?->id,
            'email' => $request->user()?->email,
        ]);
    
        return redirect()->route('home')->with('flash.success', 'Login successful!');
    }
    

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();
        
        return redirect('/');
    }


 
    
    

}