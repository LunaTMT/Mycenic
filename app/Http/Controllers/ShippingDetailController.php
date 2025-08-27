<?php

namespace App\Http\Controllers;

use App\Models\ShippingDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;

class ShippingDetailController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the shipping details.
     * - Admin: can view any user via query ?user_id=
     * - Auth user: their own
     * - Guest: must provide email
     */
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        $userId = $request->query('user_id');

        if ($currentUser && $userId && $currentUser->isAdmin()) {
            Log::info('Admin fetching shipping details', [
                'admin_id' => $currentUser->id,
                'user_id' => $userId,
            ]);

            $shippingDetails = ShippingDetail::where('user_id', $userId)->get();
        } elseif ($currentUser) {
            Log::info('Fetching shipping details for logged-in user', [
                'user_id' => $currentUser->id,
            ]);

            $shippingDetails = ShippingDetail::where('user_id', $currentUser->id)->get();
        } elseif ($request->filled('email')) {
            $user = User::where('email', $request->query('email'))->first();

            if (!$user) {
                return response()->json([], 200);
            }

            Log::info('Guest fetching shipping details by email', [
                'email' => $request->query('email'),
                'user_id' => $user->id,
            ]);

            $shippingDetails = ShippingDetail::where('user_id', $user->id)->get();
        } else {
            return response()->json(['error' => 'Authentication or email required'], 422);
        }

        Log::info('Number of shipping details fetched', [
            'count' => $shippingDetails->count(),
        ]);

        return response()->json($shippingDetails);
    }

    /**
     * Store a newly created shipping detail.
     */
    public function store(Request $request)
    {
        $currentUser = Auth::user();

        $validated = $request->validate([
            'country' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'zip' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'user_id' => 'nullable|integer|exists:users,id',
            'email' => 'nullable|email|max:255',
        ]);

        // Determine user
        if ($currentUser) {
            $userId = $currentUser->isAdmin() && !empty($validated['user_id'])
                ? $validated['user_id']
                : $currentUser->id;
        } elseif (!empty($validated['email'])) {
            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['full_name'],
                    'phone' => $validated['phone'] ?? null,
                    'password' => null, // soft registration
                ]
            );
            $userId = $user->id;
        } else {
            return response()->json(['error' => 'User not authenticated and no email provided'], 422);
        }

        // Reset existing addresses for user
        ShippingDetail::where('user_id', $userId)->update(['is_default' => false]);

        // Always create as default
        $shippingDetail = ShippingDetail::create(array_merge($validated, [
            'user_id' => $userId,
            'is_default' => true,
        ]));

        Log::info('Shipping detail created', [
            'user_id' => $userId,
            'shipping_detail_id' => $shippingDetail->id,
        ]);

        return response()->json($shippingDetail, 201);
    }

    /**
     * Show a specific shipping detail.
     */
    public function show(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('view', $shippingDetail);
        return response()->json($shippingDetail);
    }

    /**
     * Update a shipping detail.
     */
    public function update(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('update', $shippingDetail);

        Log::info('ShippingDetail update request received.', [
            'auth_user_id' => auth()->id(),
            'request_email' => $request->input('email'),
            'shipping_detail_id' => $shippingDetail->id,
        ]);

        $validated = $request->validate([
            'country' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'zip' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'delivery_instructions' => 'nullable|string',
            'user_id' => 'nullable|integer|exists:users,id',
            'email' => 'nullable|email|max:255',
        ]);

        if (!empty($validated['is_default'])) {
            ShippingDetail::where('user_id', $shippingDetail->user_id)
                ->where('id', '!=', $shippingDetail->id)
                ->update(['is_default' => false]);
        }

        $shippingDetail->update($validated);

        Log::info('ShippingDetail updated successfully.', [
            'shipping_detail_id' => $shippingDetail->id,
        ]);

        return response()->json($shippingDetail);
    }

    /**
     * Delete a shipping detail.
     */
    public function destroy(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('delete', $shippingDetail);

        Log::info('Deleting shipping detail', [
            'auth_user_id' => auth()->id(),
            'request_email' => $request->input('email'),
            'shipping_detail_id' => $shippingDetail->id,
        ]);

        $shippingDetail->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
