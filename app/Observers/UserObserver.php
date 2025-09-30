<?php

namespace App\Observers;

use App\Models\User\User;
use App\Services\UnsplashService;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    protected $unsplash;

    public function __construct(UnsplashService $unsplash)
    {
        $this->unsplash = $unsplash;
    }

    public function created(User $user): void
    {
        Log::info("UserObserver: Created event fired for User ID {$user->id}");

        if (!$user->avatar) {
            $imageUrl = $this->unsplash->getRandomMushroomImage();
            Log::info("UserObserver: No avatar found, creating one with image URL: {$imageUrl}");

            $user->avatar()->create([
                'path' => $imageUrl,
            ]);

            Log::info("UserObserver: Avatar image created for User ID {$user->id}");
        } else {
            Log::info("UserObserver: User ID {$user->id} already has an avatar.");
        }
    }
}
