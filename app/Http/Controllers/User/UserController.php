<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\User\UserContextService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserContextService $userContextService;

    public function __construct(UserContextService $userContextService)
    {
        $this->userContextService = $userContextService;
    }


    public function show(Request $request)
    {
        $user = $this->userContextService->getTargetUser($request);

        return response()->json(['user' => $user]);
    }
}
