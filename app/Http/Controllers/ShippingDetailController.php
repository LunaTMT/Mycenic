<?php

namespace App\Http\Controllers;

use App\Models\ShippingDetail;
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
        if (!$currentUser) {
            Log::warning('Guest tried fetching shipping details');
            return response()->json(['error' => 'Authentication required'], 422);
        }

        $userId = $currentUser->isAdmin() && $request->query('user_id')
            ? $request->query('user_id')
            : $currentUser->id;

        $shippingDetails = ShippingDetail::where('user_id', $userId)->get();

        Log::info('Number of shipping details fetched', ['count' => $shippingDetails->count()]);

        return response()->json($shippingDetails);
    }

    public function store(Request $request)
    {
        Log::info('ShippingDetailController@store called', [
            'auth_user_id' => Auth::id(),
            'payload' => $request->all(),
        ]);

        $currentUser = Auth::user();
        if (!$currentUser) {
            Log::warning('Guest tried to store shipping detail');
            return response()->json(['error' => 'Authentication required'], 422);
        }

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

        $userId = $currentUser->id;

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

        ShippingDetail::where('user_id', $userId)->update(['is_default' => false]);

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
            ]);
            return response()->json([
                'error' => 'Another shipping address with the same name and details already exists'
            ], 422);
        }

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

        ShippingDetail::where('user_id', $shippingDetail->user_id)
            ->where('id', '!=', $shippingDetail->id)
            ->update(['is_default' => false]);

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
