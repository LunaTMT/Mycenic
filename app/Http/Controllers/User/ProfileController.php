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
     * Update user's shipping details (updates user's default shipping detail).
     */
    public function updateShipping(Request $request): RedirectResponse
    {
        Log::info('Shipping update started', [
            'user_id' => $request->user()->id,
            'input' => $request->only(['address_line1', 'city', 'zip']),
        ]);

        $data = $request->validate([
            'address_line1' => ['required', 'string', 'max:255'],
            'city'          => ['required', 'string', 'max:100'],
            'zip'           => ['required', 'string', 'max:20'],
        ]);

        Log::info('Shipping details validated', [
            'user_id' => $request->user()->id,
            'validated' => $data,
        ]);

        $user = $request->user();

        // Update user's default shipping detail or create one if none
        $defaultShipping = $user->shippingDetails()->where('is_default', true)->first();

        if ($defaultShipping) {
            $defaultShipping->update($data);
        } else {
            // Create new default shipping detail
            $data['full_name'] = $user->name; // Or collect from request
            $data['phone'] = $user->phone ?? ''; // Or collect from request
            $data['country'] = 'United Kingdom';
            $data['is_default'] = true;

            $user->shippingDetails()->create($data);
        }

        Log::info('Shipping details updated successfully', ['user_id' => $user->id]);

        return Redirect::route('profile.index')->with('status', 'shipping-updated');
    }

    /**
     * Update the user's avatar image.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $avatar = $request->file('avatar');

        $extension = $avatar->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::random(40) . '.' . $extension;
        $destinationPath = public_path('assets/avatars');

        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }

        $avatar->move($destinationPath, $filename);

        // Delete old avatar if local and not default or external URL
        if ($user->avatar && !Str::startsWith($user->avatar, ['http', 'default-avatar.png'])) {
            $oldPath = public_path($user->avatar);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }
        }

        $user->avatar = 'assets/avatars/' . $filename;
        $user->save();

        return Redirect::route('profile.index')->with('status', 'avatar-updated');
    }

    /**
     * Store a new shipping detail for the user.
     */
    public function storeShippingDetail(Request $request)
    {
        try {
            $validated = $request->validate([
                'full_name'           => 'required|string|max:255',
                'phone'               => 'required|string|max:50',
                'address_line1'       => 'required|string|max:255',
                'address_line2'       => 'nullable|string|max:255',
                'city'                => 'required|string|max:100',
                'zip'                 => 'required|string|max:20',
                'state'               => 'nullable|string|max:100',
                'country'             => 'nullable|string|max:100',
                'delivery_instructions'=> 'nullable|string|max:1000',
                'is_default'          => 'nullable|boolean',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $validated['country'] = $validated['country'] ?? 'United Kingdom';

        $user = $request->user();

        // Optional: if is_default set true, reset other defaults
        if (!empty($validated['is_default']) && $validated['is_default']) {
            $user->shippingDetails()->update(['is_default' => false]);
        }

        $shippingDetail = $user->shippingDetails()->create($validated);

        Log::info('New shipping detail stored', [
            'user_id' => $user->id,
            'shipping_detail_id' => $shippingDetail->id,
            'data' => $validated,
        ]);

        return response()->json([
            'message' => 'Shipping detail stored successfully.',
            'shippingDetail' => $shippingDetail,
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

    /**
     * Get user's shipping details.
     */
    public function getShippingDetails(Request $request)
    {
        $user = $request->user();
        $shippingDetails = $user->shippingDetails()->latest()->get();

        return response()->json($shippingDetails);
    }
}
