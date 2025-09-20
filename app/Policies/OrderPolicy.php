<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order)
    {
        return $user->id === $order->user_id || $user->role === 'admin'
            ? Response::allow()
            : Response::deny('You do not own this order.');
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
