<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Item;
use Illuminate\Auth\Access\HandlesAuthorization;

class ItemPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any items.
     * Allow guests to view items as well.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the item.
     */
    public function view(?User $user, Item $item): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create items.
     * Only admins can create.
     */
    public function create(User $user): bool
    {
        return $user->is_admin ?? false;
    }

    /**
     * Determine whether the user can update the item.
     * Only admins can update.
     */
    public function update(User $user, Item $item): bool
    {
        return $user->is_admin ?? false;
    }

    /**
     * Determine whether the user can delete the item.
     * Only admins can delete.
     */
    public function delete(User $user, Item $item): bool
    {
        return $user->is_admin ?? false;
    }
}
