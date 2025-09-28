<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the list of users.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response
     */
    public function viewAny(User $user)
    {
        return $user->isAdmin(); // Only admins can view other users
    }

    /**
     * Determine whether the user can view the target user's profile.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\User  $targetUser
     * @return \Illuminate\Auth\Access\Response
     */
    public function view(User $user, User $targetUser)
    {
        return $user->isAdmin() || $user->id === $targetUser->id; // Admin can view any, others can view their own
    }
}
