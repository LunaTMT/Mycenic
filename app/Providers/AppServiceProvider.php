<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

use App\Models\User;
use App\Observers\UserObserver;

use App\Services\UnsplashService;
use App\Services\OpenAIModerationService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ✅ Register UnsplashService as a singleton
        $this->app->singleton(UnsplashService::class);

        // ✅ Register OpenAIModerationService as a singleton
        $this->app->singleton(OpenAIModerationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('flash.success'),
                    'error'   => session('flash.error'),
                ];
            },
        ]);

        // ✅ Register the observer properly
        User::observe(app(UserObserver::class));
    }
}
