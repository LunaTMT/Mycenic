<?php

namespace App\Policies;

use App\Models\User\User;
use App\Models\User\Address;
use Illuminate\Auth\Access\HandlesAuthorization;

class AddressPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the address.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Auth\Access\Response
     */
    public function view(User $user, Address $address)
    {
        return $user->id === $address->user_id;
    }

    /**
     * Determine whether the user can update the address.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Auth\Access\Response
     */
    public function update(User $user, Address $address)
    {
        return $user->id === $address->user_id;
    }

    /**
     * Determine whether the user can delete the address.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Address  $address
     * @return \Illuminate\Auth\Access\Response
     */
    public function delete(User $user, Address $address)
    {
        return $user->id === $address->user_id;
    }
}
