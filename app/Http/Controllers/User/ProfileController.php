<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\File;

use App\Models\ShippingDetail;
use App\Models\User;

use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $user = $currentUser;

        // If admin and there's a user_id in query, load that user instead
        if ($currentUser->isAdmin() && $request->has('user_id')) {
            $userToView = User::with('shippingDetails')->find($request->query('user_id'));
            if ($userToView) {
                $user = $userToView;
            }
        } else {
            $user->load('shippingDetails');
        }

        $initialTab = $request->query('initialTab');

        return Inertia::render('Profile/Profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user,
            'initialTab' => $initialTab,
            'isAdmin' => $currentUser->isAdmin(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request)
    {
        Log::info('Profile update request input', $request->all());
        Log::info('Profile update request files', $request->files->all());

        Log::info('Profile update started', ['user_id' => $request->user()->id]);

        $user = $request->user();
        $validated = $request->validated();

        if ($request->hasFile('avatar')) {
            Log::info('Avatar file detected, processing upload', ['user_id' => $user->id]);

            $avatar = $request->file('avatar');
            $extension = $avatar->getClientOriginalExtension() ?: 'jpg';
            $filename = Str::random(40) . '.' . $extension;
            $destinationPath = public_path('assets/avatars');

            if (!File::exists($destinationPath)) {
                Log::info('Avatar destination directory does not exist, creating...', ['path' => $destinationPath]);
                File::makeDirectory($destinationPath, 0755, true);
            }

            try {
                $avatar->move($destinationPath, $filename);
                Log::info('Avatar file moved successfully', ['filename' => $filename, 'path' => $destinationPath]);
            } catch (\Exception $e) {
                Log::error('Failed to move avatar file', ['error' => $e->getMessage()]);
                // Optionally rethrow or handle the error here
                throw $e;
            }

            if ($user->avatar && !Str::startsWith($user->avatar, ['http', 'default-avatar.png'])) {
                $oldPath = public_path($user->avatar);
                if (File::exists($oldPath)) {
                    Log::info('Deleting old avatar', ['old_avatar_path' => $oldPath]);
                    File::delete($oldPath);
                } else {
                    Log::warning('Old avatar file not found for deletion', ['old_avatar_path' => $oldPath]);
                }
            }

            $validated['avatar'] = 'assets/avatars/' . $filename;
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            Log::info('User email changed, resetting email verification', ['user_id' => $user->id]);
            $user->email_verified_at = null;
        }

        $user->save();
        Log::info('User profile updated successfully', ['user_id' => $user->id]);

        // Return empty 204 No Content response
        return response()->noContent();
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

        return Redirect::to('/')->with('flash.success', 'Account successfully deleted.');
    }

    /**
     * Search users by name or email (for admin user selector).
     */
    public function searchUsers(Request $request)
    {
        $search = $request->query('q', '');
        Log::info('User search initiated', ['query' => $search, 'admin_user_id' => $request->user()->id ?? null]);

        $users = User::query()
            ->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->limit(20)
            ->get(['id', 'name', 'email']);

        Log::info('User search completed', ['query' => $search, 'results_count' => $users->count()]);

        return response()->json($users);
    }


}
