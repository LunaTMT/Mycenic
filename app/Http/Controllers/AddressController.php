<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\User;  // Import User model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses;

        return response()->json($addresses);
    }

    /**
     * Store a newly created address.
     */
    public function store(Request $request)
    {
        // Validate the incoming request, with required name, email and optional phone
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],  // Required name field
            'address' => ['required', 'string', 'max:255'],
            'city'    => ['required', 'string', 'max:255'],
            'zip'     => ['required', 'string', 'max:20'],
            'phone'   => ['nullable', 'string', 'max:15'],  // Optional phone field
            'email'   => ['required', 'email', 'max:255'],  // Required email field
        ]);

        // Check if the user with the provided email exists
        $user = User::where('email', $validated['email'])->first();

        // If the user doesn't exist, create a new one with no password (soft registration)
        if (!$user) {
            $user = User::create([
                'name'  => $validated['name'],
                'email' => $validated['email'],
                'password' => null, // No password for soft registration
            ]);
        }

        // Create a new address record and set the user_id
        $address = new Address($validated);
        $address->user_id = $user->id;
        $address->save();

        // Return a response with a success message and the new address
        return response()->json([
            'message' => 'Address added successfully.',
            'address' => $address,
        ]);
    }
}
