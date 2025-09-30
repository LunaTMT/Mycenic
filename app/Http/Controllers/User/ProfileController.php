<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Order;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use App\Models\User\User;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    /**
     * Show the user's profile.
     */
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $user = $currentUser;

        // Admin can view other users
        if ($currentUser->isAdmin() && $request->has('user_id')) {
            $userToView = User::with(['addresses', 'avatar'])->find($request->query('user_id'));
            if ($userToView) {
                $user = $userToView;
            }
        } else {
            $user->load(['addresses', 'avatar']);
        }

        $user = $user->fresh();

        // Fetch user's orders
        $orders = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $initialTab = $request->query('initialTab');

        return Inertia::render('Profile/Profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user->toArray(),
            'initialTab' => $initialTab,
            'orders' => $orders, // Pass orders for the profile tab
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request)
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            if ($request->hasFile('avatar')) {
                Log::info('Avatar file detected, processing upload', ['user_id' => $user->id]);

                // Delete old avatar if exists
                if ($user->avatar) {
                    $oldPath = str_replace('/storage/', '', $user->avatar->path);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                        Log::info('Deleted old avatar file', ['path' => $oldPath]);
                    }
                    $user->avatar()->delete();
                }

                // Store new avatar
                $path = $request->file('avatar')->store('avatars', 'public');
                $publicPath = Storage::url($path);

                $user->avatar()->create([
                    'path' => $publicPath,
                ]);

                Log::info('Stored new avatar', ['path' => $publicPath]);
            }

            // Update other validated fields except avatar
            $fields = collect($validated)->except('avatar')->toArray();
            $user->fill($fields);

            if ($user->isDirty('email')) {
                Log::info('User email changed, resetting email verification', ['user_id' => $user->id]);
                $user->email_verified_at = null;
            }

            $user->save();
            Log::info('User profile updated successfully', ['user_id' => $user->id]);

            return back()->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id ?? null,
            ]);

            return back()->with('error', 'Failed to update profile. Please try again.');
        }
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
