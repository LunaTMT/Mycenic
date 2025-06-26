<?php

namespace App\Observers;

use App\Models\User;
use App\Services\UnsplashService;

class UserObserver
{
    protected $unsplash;

    public function __construct(UnsplashService $unsplash)
    {
        $this->unsplash = $unsplash;
    }


    public function creating(User $user): void
    {
        if (empty($user->avatar)) {
            $user->avatar = $this->unsplash->getRandomMushroomImage();
        }
    }
}
