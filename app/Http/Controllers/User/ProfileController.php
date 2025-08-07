<?php

namespace App\Http\Controllers\User;


use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\File;

use App\Models\Address;
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
            $userToView = User::with('addresses')->find($request->query('user_id'));
            if ($userToView) {
                $user = $userToView;
            }
        } else {
            $user->load('addresses');
        }

        // Get initialTab from query — null if not present
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

        return Redirect::route('profile.index');
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

        return Redirect::route('profile.index')->with('status', 'shipping-updated');
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

        // Get the original extension, fallback to jpg if missing
        $extension = $avatar->getClientOriginalExtension();
        if (!$extension) {
            $extension = 'jpg'; // fallback extension
        }

        $filename = Str::random(40) . '.' . $extension;
        $destinationPath = public_path('assets/avatars');

        // Ensure the directory exists
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }

        // Move the uploaded file to public/assets/avatars
        $avatar->move($destinationPath, $filename);

        // Remove old avatar if local (not default or external URL)
        if ($user->avatar && !Str::startsWith($user->avatar, 'http') && !Str::startsWith($user->avatar, 'default-avatar.png')) {
            $oldPath = public_path($user->avatar);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }
        }

        // Save new avatar path relative to public with extension
        $user->avatar = 'assets/avatars/' . $filename;
        $user->save();

        return redirect()->route('profile.index')->with('status', 'Avatar updated.');
    }

    /**
     * Store a new address for the user.
     */
    public function storeAddress(Request $request)
    {
        try {
            $validated = $request->validate([
                'label'   => 'nullable|string|max:50',
                'address' => 'required|string|max:255',
                'city'    => 'required|string|max:100',
                'zip'     => 'required|string|max:20',
                'country' => 'nullable|string|max:100',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $validated['country'] = $validated['country'] ?? 'UK';

        $user = $request->user();

        $exists = $user->addresses()
            ->where('address', $validated['address'])
            ->where('city', $validated['city'])
            ->where('zip', $validated['zip'])
            ->where('country', $validated['country'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This address already exists.',
            ], 409);
        }

        $address = $user->addresses()->create($validated);

        \Log::info('New address stored', [
            'user_id'    => $user->id,
            'address_id' => $address->id,
            'data'       => $validated,
        ]);

        return response()->json([
            'message' => 'Address stored successfully.',
            'address' => $address,
        ]);
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

        // Flash a success message before redirecting
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

    public function getAddresses(Request $request)
    {
        $user = $request->user();

        // Load addresses
        $addresses = $user->addresses()->latest()->get();

        return response()->json($addresses);
    }

}
