<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     */
    public function index(Request $request)
    {
        $authUser = $request->user();

        // If the authenticated user is an admin and a user_id query param is passed,
        // fetch the addresses for that user, otherwise use the authenticated user
        if ($authUser->isAdmin() && $request->has('user_id')) {
            $user = User::find($request->query('user_id'));
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
        } else {
            $user = $authUser;
        }

        Log::info('Fetching addresses for user', ['user_id' => $user->id]);

        $addresses = $user->addresses;

        return response()->json($addresses);
    }


    /**
     * Store a newly created address.
     */
    public function store(Request $request)
    {
        Log::info('Address store request received', ['input' => $request->all()]);

        $user = $request->user();

        if ($user) {
            // Authenticated user: validate without email (email comes from auth)
            $validated = $request->validate([
                'name'    => ['nullable', 'string', 'max:255'],  // optional override or empty
                'address' => ['required', 'string', 'max:255'],
                'city'    => ['required', 'string', 'max:255'],
                'zip'     => ['required', 'string', 'max:20'],
            ]);

     
            $validated['name'] = $validated['name'] ?? $user->name;
     

            Log::info('Authenticated user submitting address', ['user_id' => $user->id]);
        } else {
            // Guest user: validate including email and name
            $validated = $request->validate([
                'name'    => ['nullable', 'string', 'max:255'],
                'email'   => ['required', 'email', 'max:255'],
                'address' => ['required', 'string', 'max:255'],
                'city'    => ['required', 'string', 'max:255'],
            ]);

            Log::info('Guest user submitting address', ['email' => $validated['email']]);
        }


        // Create address linked to user
        $address = new Address($validated);
        $address->user_id = $user->id;
        $address->save();

        Log::info('New address saved', ['address_id' => $address->id, 'user_id' => $user->id]);

        return response()->json([
            'address' => $address,
        ]);
    }

}
