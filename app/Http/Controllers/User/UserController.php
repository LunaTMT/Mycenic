<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Return user data as JSON.
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();

        Log::info('UserController@index called', [
            'current_user_id' => $currentUser->id,
            'is_admin' => $currentUser->isAdmin(),
            'requested_user_id' => $request->query('user_id'),
        ]);

        $user = $currentUser;

        if ($currentUser->isAdmin() && $request->has('user_id')) {
            Log::info('Admin trying to view another user', [
                'admin_id' => $currentUser->id,
                'target_user_id' => $request->query('user_id'),
            ]);

            $userToView = User::with('shippingDetails', 'avatar')->find($request->query('user_id'));
            if ($userToView) {
                Log::info('User found', ['target_user_id' => $userToView->id]);
                $user = $userToView;
            } else {
                Log::warning('Requested user not found', ['target_user_id' => $request->query('user_id')]);
            }
        } else {
            Log::info('Non-admin user or no user_id provided, loading own details', [
                'user_id' => $currentUser->id,
            ]);
            $user->load('shippingDetails', 'avatar');
        }

        // Log the entire user object as array
        Log::info('Full user object', $user->toArray());

        return response()->json([
            'user' => $user,
            'isAdmin' => $currentUser->isAdmin(),
        ]);
    }
}
