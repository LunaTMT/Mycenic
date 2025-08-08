<?php

namespace App\Policies;

use App\Models\ShippingDetail;
use App\Models\User;

class ShippingDetailPolicy
{
    /**
     * Global check for admin to bypass all other checks.
     */
    public function before(User $user, $ability)
    {
        if ($user->isAdmin()) {
            return true;  // Admin can do everything
        }
    }

    public function viewAny(User $user): bool
    {
        return false; // non-admins can't view all
    }

    public function view(User $user, ShippingDetail $shippingDetail): bool
    {
        return $user->id === $shippingDetail->user_id;
    }

    public function update(User $user, ShippingDetail $shippingDetail): bool
    {
        return $user->id === $shippingDetail->user_id;
    }

    public function delete(User $user, ShippingDetail $shippingDetail): bool
    {
        return $user->id === $shippingDetail->user_id;
    }

    public function restore(User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }

    public function forceDelete(User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }
}
