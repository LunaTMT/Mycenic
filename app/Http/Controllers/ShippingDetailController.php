<?php

namespace App\Http\Controllers;

use App\Models\ShippingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;


class ShippingDetailController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the shipping details for the current user.
     */
    public function index(Request $request)
    {
        $currentUser = Auth::user();

        $userId = $request->query('user_id');

        if ($userId && $currentUser->isAdmin()) {
            // Admin can fetch shipping details of any user by user_id
            \Log::info('Admin fetching shipping details', [
                'admin_id' => $currentUser->id,
                'user_id' => $userId,
            ]);

            $shippingDetails = ShippingDetail::where('user_id', $userId)->get();

            \Log::info('Number of shipping details fetched for user', [
                'user_id' => $userId,
                'count' => $shippingDetails->count(),
            ]);
        } else {
            // Non-admin or no user_id: return current user's shipping details
            \Log::info('Fetching shipping details for current user', [
                'user_id' => $currentUser->id,
            ]);

            $shippingDetails = ShippingDetail::where('user_id', $currentUser->id)->get();

            \Log::info('Number of shipping details fetched', [
                'count' => $shippingDetails->count(),
            ]);
        }

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
            'phone' => 'required|string|max:50',
            'zip' => 'nullable|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'delivery_instructions' => 'nullable|string',
            'user_id' => 'nullable|integer|exists:users,id', // allow user_id if admin
        ]);

        // Determine which user_id to use
        if ($currentUser->isAdmin() && !empty($validated['user_id'])) {
            $userId = $validated['user_id'];
        } else {
            $userId = $currentUser->id;
        }

        // If this is default, reset others for that user
        if (!empty($validated['is_default']) && $validated['is_default'] === true) {
            ShippingDetail::where('user_id', $userId)->update(['is_default' => false]);
        }

        // Create with user_id set accordingly
        $shippingDetail = ShippingDetail::create(array_merge($validated, ['user_id' => $userId]));

        return response()->json($shippingDetail, 201);
    }

    /**
     * Show a specific shipping detail.
     */
    public function show(ShippingDetail $shippingDetail)
    {
        $this->authorize('view', $shippingDetail);
        return response()->json($shippingDetail);
    }

    /**
     * Update a shipping detail.
     */
    

    /**
     * Update a shipping detail.
     */
    public function update(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('update', $shippingDetail);

        Log::info('ShippingDetail update request received.', [
            'user_id' => auth()->id(),
            'shipping_detail_id' => $shippingDetail->id,
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'country' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'zip' => 'nullable|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'delivery_instructions' => 'nullable|string',
        ]);

        Log::info('ShippingDetail validated data.', [
            'validated_data' => $validated,
        ]);

        // If is_default is true, reset others
        if (!empty($validated['is_default']) && $validated['is_default'] === true) {
            Log::info('Resetting other default shipping details for this user.', [
                'user_id' => $shippingDetail->user_id,
                'current_shipping_detail_id' => $shippingDetail->id,
            ]);

            ShippingDetail::where('user_id', $shippingDetail->user_id)
                ->where('id', '!=', $shippingDetail->id)
                ->update(['is_default' => false]);
        }

        $shippingDetail->update($validated);

        Log::info('ShippingDetail updated successfully.', [
            'shipping_detail_id' => $shippingDetail->id,
            'updated_data' => $shippingDetail->toArray(),
        ]);

        return response()->json($shippingDetail);
    }


    /**
     * Delete a shipping detail.
     */
    public function destroy(ShippingDetail $shippingDetail)
    {
        $this->authorize('delete', $shippingDetail);
        $shippingDetail->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
