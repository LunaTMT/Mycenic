<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        Log::info('Profile edit page viewed', ['user_id' => $request->user()->id]);
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        Log::info('Profile update started', ['user_id' => $request->user()->id, 'validated' => $request->validated()]);

        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            Log::info('User changed email, resetting verification', ['user_id' => $user->id, 'old_email' => $user->getOriginal('email'), 'new_email' => $user->email]);
            $user->email_verified_at = null;
        }

        $user->save();
        Log::info('Profile update completed', ['user_id' => $user->id]);

        return Redirect::route('profile.edit');
    }

    public function updateShipping(Request $request): RedirectResponse

    {
        Log::info('Shipping update started', [
            'user_id' => $request->user()->id,
            'input' => $request->only(['address', 'city', 'zip']),
        ]);

        // 1. Validate only the fields we're using
        $data = $request->validate([
            'address' => ['required', 'string', 'max:255'],
            'city'    => ['required', 'string', 'max:100'],
            'zip'     => ['required', 'string', 'max:20'],
        ]);

        Log::info('Shipping details validated', [
            'user_id' => $request->user()->id,
            'validated' => $data,
        ]);

        // 2. Update the authenticated user's shipping fields
        $user = $request->user();

        try {
            $user->update([
                'address' => $data['address'],
                'city'    => $data['city'],
                'zip'     => $data['zip'],
            ]);

            Log::info('Shipping details updated successfully', [
                'user_id' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating shipping details', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        // 3. Redirect back with a flash message if needed
        return Redirect::route('profile.edit')->with('status', 'shipping-updated');
    }
    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Log::info('Account deletion initiated', ['user_id' => $request->user()->id]);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Log::info('Account deleted', ['user_id' => $user->id]);

        return Redirect::to('/');
    }
}
