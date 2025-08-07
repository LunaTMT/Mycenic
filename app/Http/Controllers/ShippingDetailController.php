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
    public function index()
    {
        $user = Auth::user();

        $shippingDetails = ShippingDetail::where('user_id', $user->id)->get();

        return response()->json($shippingDetails);
    }

    /**
     * Store a newly created shipping detail.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

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

        // If this is default, reset others
        if (!empty($validated['is_default']) && $validated['is_default'] === true) {
            ShippingDetail::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $shippingDetail = ShippingDetail::create(array_merge($validated, ['user_id' => $user->id]));

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
