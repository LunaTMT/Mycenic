<?php

namespace App\Policies;


use App\Models\ShippingDetail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ShippingDetailPolicy
{
    public function before(User $user = null, $ability)
    {
        if ($user && $user->isAdmin()) {
            return true;  // Admin can do everything
        }
    }

    public function view(?User $user, ShippingDetail $shippingDetail): bool
    {
        if ($user) {
            return $user->id === $shippingDetail->user_id;
        }

        // Guests: check request email against shipping detail
        return request()->has('email') && 
               $shippingDetail->user && 
               $shippingDetail->user->email === request('email');
    }

    public function update(?User $user, ShippingDetail $shippingDetail): bool
    {
        return $this->view($user, $shippingDetail);
    }

    public function delete(?User $user, ShippingDetail $shippingDetail): bool
    {
        return $this->view($user, $shippingDetail);
    }

    public function restore(?User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }

    public function forceDelete(?User $user, ShippingDetail $shippingDetail): bool
    {
        return false;
    }
}
