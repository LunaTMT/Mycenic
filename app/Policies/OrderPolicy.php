<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders.
     * All logged-in users can view orders (filtered in controller).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific order.
     * Users can view their own orders; admins can view any order.
     */
    public function view(User $user, Order $order)
    {
        return $user->id === $order->user_id || $user->role === 'admin'
            ? Response::allow()
            : Response::deny('You do not own this order.');
    }

    public function create(User $user): bool
    {
        return false; // No one can create orders manually
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
