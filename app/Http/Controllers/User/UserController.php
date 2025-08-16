<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Return user data as JSON.
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        $user = $currentUser;

        if ($currentUser->isAdmin() && $request->has('user_id')) {
            $userToView = User::with('shippingDetails', 'avatar')->find($request->query('user_id'));
            if ($userToView) {
                $user = $userToView;
            }
        } else {
            $user->load('shippingDetails', 'avatar');
        }

        return response()->json([
            'user' => $user,
            'isAdmin' => $currentUser->isAdmin(),
        ]);
    }
}
