<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User\User;
use Illuminate\Http\Request;
use Auth;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            $user = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Unable to login with ' . ucfirst($provider));
        }

        // Check if the user exists
        $existingUser = User::where('email', $user->getEmail())->first();

        if ($existingUser) {
            Auth::login($existingUser, true);
            return redirect()
                ->route('home')
                ->with('flash.success', "Login with {$provider} successful!");
        }
        

        // If user does not exist, create a new one
        $newUser = User::create([
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'provider' => $provider,
            'provider_id' => $user->getId(),
        ]);

        Auth::login($newUser, true);
        return redirect()
                ->route('home')
                ->with('flash.success', "Login with {$provider} successful!");
    }
}
