<?php

namespace App\Http\Controllers;

use App\Models\ShippingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShippingDetailController extends Controller
{
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
        if (!empty($validated['is_default'])) {
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
    public function update(Request $request, ShippingDetail $shippingDetail)
    {
        $this->authorize('update', $shippingDetail);

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

        if (!empty($validated['is_default'])) {
            ShippingDetail::where('user_id', $shippingDetail->user_id)->update(['is_default' => false]);
        }

        $shippingDetail->update($validated);

        return response()->json($shippingDetail);
    }

    /**
     * Delete a shipping detail.
     */
    public function destroy(ShippingDetail $shippingDetail)
    {
        $this->authorize('delete', $shippingDetail);

        $shippingDetail->delete();

        return response()->json(null, 204);
    }
}
