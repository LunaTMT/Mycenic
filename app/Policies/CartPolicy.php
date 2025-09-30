<?php

namespace App\Policies;

use App\Models\Cart\Cart;
use App\Models\User\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CartPolicy
{
    use HandlesAuthorization;

    public function view(?User $user, Cart $cart): bool
    {
        return $cart->user_id === ($user->id ?? null) || $cart->user_id === null;
    }

    public function addItem(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    public function update(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    public function removeItem(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }

    public function clear(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id;
    }
}
