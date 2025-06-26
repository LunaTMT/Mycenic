<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\File;

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
            Log::info('User changed email, resetting verification', [
                'user_id' => $user->id,
                'old_email' => $user->getOriginal('email'),
                'new_email' => $user->email
            ]);
            $user->email_verified_at = null;
        }

        $user->save();
        Log::info('Profile update completed', ['user_id' => $user->id]);

        return Redirect::route('profile.edit');
    }

    /**
     * Update user's shipping details.
     */
    public function updateShipping(Request $request): RedirectResponse
    {
        Log::info('Shipping update started', [
            'user_id' => $request->user()->id,
            'input' => $request->only(['address', 'city', 'zip']),
        ]);

        $data = $request->validate([
            'address' => ['required', 'string', 'max:255'],
            'city'    => ['required', 'string', 'max:100'],
            'zip'     => ['required', 'string', 'max:20'],
        ]);

        Log::info('Shipping details validated', [
            'user_id' => $request->user()->id,
            'validated' => $data,
        ]);

        $user = $request->user();

        try {
            $user->update([
                'address' => $data['address'],
                'city'    => $data['city'],
                'zip'     => $data['zip'],
            ]);

            Log::info('Shipping details updated successfully', ['user_id' => $user->id]);
        } catch (\Exception $e) {
            Log::error('Error updating shipping details', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'shipping-updated');
    }

    /**
     * Update the user's avatar image.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        $avatar = $request->file('avatar');
        $filename = Str::random(40) . '.' . $avatar->getClientOriginalExtension();
        $destinationPath = public_path('assets/avatars');

        // Make sure the directory exists
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }

        // Move the uploaded file to public/assets/avatars
        $avatar->move($destinationPath, $filename);

        // Remove old avatar if it's local (and not default)
        if ($user->avatar && !Str::startsWith($user->avatar, 'http') && !Str::startsWith($user->avatar, 'default-avatar.png')) {
            $oldPath = public_path($user->avatar);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }
        }

        // Save new avatar path relative to public
        $user->avatar = 'assets/avatars/' . $filename;
        $user->save();

        return redirect()->route('profile.edit')->with('status', 'Avatar updated.');
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
