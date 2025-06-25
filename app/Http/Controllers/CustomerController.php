<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Return customer data by ID, with access control:
     * - Admins can view anyone
     * - Users can only view their own profile
     */
    public function show($id)
    {
        $authUser = Auth::user();

        Log::info('CustomerController@show accessed', [
            'requested_id' => $id,
            'auth_user_id' => $authUser?->id,
            'auth_user_role' => $authUser?->role,
        ]);

        // Check if user is admin OR is viewing their own profile
        if ($authUser->role !== 'admin' && $authUser->id != $id) {
            Log::warning('Unauthorized access attempt to customer data', [
                'requested_id' => $id,
                'auth_user_id' => $authUser->id,
                'auth_user_role' => $authUser->role,
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        Log::info('Customer data retrieved successfully', [
            'user_id' => $user->id,
            'user_email' => $user->email,
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'zip' => $user->zip,
            'email_verified_at' => $user->email_verified_at,
            'avatar' => $user->avatar,
            'provider' => $user->provider,
            'provider_id' => $user->provider_id,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }
}
