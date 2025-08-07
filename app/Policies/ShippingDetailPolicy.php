<?php

namespace App\Policies;

use App\Models\ShippingDetail;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ShippingDetailPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
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


    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }
}
