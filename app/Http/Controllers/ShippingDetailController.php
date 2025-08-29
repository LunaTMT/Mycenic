<?php

namespace App\Http\Controllers;

use App\Models\ShippingDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ShippingDetailController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        Log::info('ShippingDetailController@index called', [
            'auth_user_id' => Auth::id(),
            'query_params' => $request->all(),
        ]);

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
                Log::warning('Guest tried fetching shipping details but no user found', [
                    'email' => $request->query('email'),
                ]);
                return response()->json([], 200);
            }

            Log::info('Guest fetching shipping details by email', [
                'email' => $request->query('email'),
                'user_id' => $user->id,
            ]);
            $shippingDetails = ShippingDetail::where('user_id', $user->id)->get();
        } else {
            Log::error('Shipping detail fetch failed: no authentication or email provided');
            return response()->json(['error' => 'Authentication or email required'], 422);
        }

        Log::info('Number of shipping details fetched', [
            'count' => $shippingDetails->count(),
        ]);

        return response()->json($shippingDetails);
    }

    public function store(Request $request)
    {
        Log::info('ShippingDetailController@store called', [
            'auth_user_id' => Auth::id(),
            'payload' => $request->all(),
        ]);

        $currentUser = Auth::user();

        try {
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

            Log::info('Shipping store validated successfully', ['validated' => $validated]);
        } catch (ValidationException $e) {
            Log::warning('Shipping store validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        // Determine user ID
        if ($currentUser) {
            $userId = $currentUser->isAdmin() && !empty($validated['user_id'])
                ? $validated['user_id']
                : $currentUser->id;
            Log::info('User determined from auth', ['user_id' => $userId]);
        } elseif (!empty($validated['email'])) {
            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['full_name'],
                    'phone' => $validated['phone'] ?? null,
                    'password' => null,
                ]
            );
            $userId = $user->id;
            Log::info('User created from email', ['user_id' => $userId]);
        } else {
            Log::error('User not authenticated and no email provided');
            return response()->json(['error' => 'User not authenticated and no email provided'], 422);
        }

        // Prevent duplicate address for same user and full name
        $existing = ShippingDetail::where('user_id', $userId)
            ->where('full_name', $validated['full_name'])
            ->where('address_line1', $validated['address_line1'])
            ->where('address_line2', $validated['address_line2'] ?? null)
            ->where('city', $validated['city'])
            ->where('zip', $validated['zip'])
            ->first();

        if ($existing) {
            Log::info('Duplicate shipping address detected', [
                'user_id' => $userId,
                'existing_shipping_id' => $existing->id,
            ]);
            return response()->json(['error' => 'This shipping address already exists for this name'], 422);
        }

        // Make all other addresses not default
        ShippingDetail::where('user_id', $userId)->update(['is_default' => false]);
        Log::info('All other shipping addresses set to not default', ['user_id' => $userId]);

        $shippingDetail = ShippingDetail::create(array_merge($validated, [
            'user_id' => $userId,
            'is_default' => true,
        ]));

        Log::info('Shipping detail created successfully', [
            'user_id' => $userId,
            'shipping_detail_id' => $shippingDetail->id,
        ]);

        return response()->json($shippingDetail, 201);
    }


    public function show(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('view', $shippingDetail);
        return response()->json($shippingDetail);
    }

    public function update(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('update', $shippingDetail);

        try {
            $validated = $request->validate([
                'country' => 'required|string|max:255',
                'full_name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:50',
                'zip' => 'required|string|max:20',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city' => 'required|string|max:255',
                'state' => 'nullable|string|max:255',
                'delivery_instructions' => 'nullable|string',
                'user_id' => 'nullable|integer|exists:users,id',
                'email' => 'nullable|email|max:255',
            ]);
            Log::info('Shipping update validated', ['validated' => $validated]);
        } catch (ValidationException $e) {
            Log::warning('Shipping update validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        // Prevent duplicate address on update including full name
        $duplicate = ShippingDetail::where('user_id', $shippingDetail->user_id)
            ->where('id', '!=', $shippingDetail->id)
            ->where('full_name', $validated['full_name'])
            ->where('address_line1', $validated['address_line1'])
            ->where('address_line2', $validated['address_line2'] ?? null)
            ->where('city', $validated['city'])
            ->where('zip', $validated['zip'])
            ->first();

        if ($duplicate) {
            Log::info('Duplicate shipping address detected', [
                'user_id' => $shippingDetail->user_id,
                'duplicate_id' => $duplicate->id,
                'full_name' => $duplicate->full_name,
                'address_line1' => $duplicate->address_line1,
                'city' => $duplicate->city,
                'zip' => $duplicate->zip,
            ]);

            return response()->json([
                'error' => 'Another shipping address with the same name and details already exists'
            ], 422);
        } else {
            Log::info('No duplicate shipping address found', [
                'user_id' => $shippingDetail->user_id,
                'shipping_id' => $shippingDetail->id
            ]);
        }

        // Update shipping detail
        $shippingDetail->update($validated);
        Log::info('Shipping detail updated successfully', ['shipping_id' => $shippingDetail->id]);

        return response()->json([
            'message' => 'Shipping detail updated successfully',
            'data' => $shippingDetail,
        ]);
    }



    public function setDefault(ShippingDetail $shippingDetail)
    {
        $this->authorize('update', $shippingDetail);

        Log::info('Setting shipping address as default initiated', [
            'user_id' => $shippingDetail->user_id,
            'shipping_id' => $shippingDetail->id
        ]);

        // Reset other defaults
        $affected = ShippingDetail::where('user_id', $shippingDetail->user_id)
            ->where('id', '!=', $shippingDetail->id)
            ->update(['is_default' => false]);

        Log::info('Other shipping addresses reset to non-default', [
            'user_id' => $shippingDetail->user_id,
            'affected_count' => $affected
        ]);

        // Set this one as default
        $shippingDetail->update(['is_default' => true]);

        Log::info('Shipping address successfully set as default', [
            'user_id' => $shippingDetail->user_id,
            'shipping_id' => $shippingDetail->id
        ]);

        return response()->json([
            'message' => 'Default shipping address updated',
            'data' => $shippingDetail,
        ]);
    }


    public function destroy(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('delete', $shippingDetail);

        $shippingDetail->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
