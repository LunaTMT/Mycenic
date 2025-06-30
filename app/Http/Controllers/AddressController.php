<?php

namespace App\Http\Controllers;

use App\Models\Address;
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
        $validated = $request->validate([
            'address' => ['required', 'string', 'max:255'],
            'city'    => ['required', 'string', 'max:255'],
            'zip'     => ['required', 'string', 'max:20'],
        ]);

        $address = new Address($validated);
        $address->user_id = $request->user()->id;
        $address->save();

        return response()->json([
            'message' => 'Address added successfully.',
            'address' => $address,
        ]);
    }
}
