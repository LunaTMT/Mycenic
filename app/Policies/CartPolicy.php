<?php

namespace App\Policies;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CartPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the cart.
     */
    public function view(?User $user, Cart $cart): bool
    {
        return $cart->user_id === ($user->id ?? null) || $cart->user_id === null;
    }

    /**
     * Determine whether the user can add items to the cart.
     */
    public function addItem(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    /**
     * Determine whether the user can update a cart item.
     */
    public function update(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    /**
     * Determine whether the user can remove a cart item.
     */
    public function removeItem(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    /**
     * Determine whether the user can clear the cart.
     */
    public function clear(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }
}
