<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AddressController extends Controller
{
    use AuthorizesRequests;

    // Fetch all addresses for the authenticated user
    public function index(Request $request)
    {
        Log::info('Fetching all addresses for user', ['user_id' => Auth::id()]);

        $user = Auth::user();
        if (!$user) {
            Log::warning('Guest tried fetching addresses');
            return response()->json(['error' => 'Authentication required'], 422);
        }

        $addresses = $user->addresses;  // Eloquent relationship for fetching addresses

        return response()->json($addresses);
    }

    // Store a new address for the authenticated user
    public function store(Request $request)
    {
        Log::info('Storing a new address', ['user_id' => Auth::id()]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 422);
        }

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

        // Ensure no duplicates for the same user
        $existing = $user->addresses()->where('full_name', $validated['full_name'])
            ->where('address_line1', $validated['address_line1'])
            ->where('address_line2', $validated['address_line2'] ?? null)
            ->where('city', $validated['city'])
            ->where('zip', $validated['zip'])
            ->first();

        if ($existing) {
            return response()->json(['error' => 'This address already exists'], 422);
        }

        // Set other addresses as non-default if this one is set as default
        Address::where('user_id', $user->id)->update(['is_default' => false]);

        $address = $user->addresses()->create(array_merge($validated, [
            'is_default' => true,
        ]));

        return response()->json($address, 201);
    }

    // Show a specific address
    public function show(Address $address)
    {
        $this->authorize('view', $address);  // Ensure the user is authorized to view the address

        return response()->json($address);
    }

    // Update an existing address
    public function update(Request $request, Address $address)
    {
        $this->authorize('update', $address);  // Ensure the user is authorized to update the address

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
            'is_default' => 'nullable|boolean',  // Allow 'is_default' to be updated
        ]);

        // Check for duplicate addresses
        $duplicate = Address::where('user_id', $address->user_id)
            ->where('id', '!=', $address->id)
            ->where('full_name', $validated['full_name'])
            ->where('address_line1', $validated['address_line1'])
            ->where('address_line2', $validated['address_line2'] ?? null)
            ->where('city', $validated['city'])
            ->where('zip', $validated['zip'])
            ->first();

        if ($duplicate) {
            return response()->json(['error' => 'This address already exists for another address'], 422);
        }

        // Update the 'is_default' status if necessary
        if ($validated['is_default'] ?? false) {
            Address::where('user_id', $address->user_id)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json(['message' => 'Address updated successfully', 'data' => $address]);
    }

    // Delete a specific address
    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);  // Ensure the user is authorized to delete the address

        // If the default address is being deleted, set another one as default
        if ($address->is_default) {
            $nextDefault = Address::where('user_id', $address->user_id)
                ->where('id', '!=', $address->id)
                ->first();

            if ($nextDefault) {
                $nextDefault->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }
}
