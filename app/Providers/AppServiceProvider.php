<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

use App\Models\User;
use App\Observers\UserObserver;

use App\Services\UnsplashService;
use App\Services\OpenAIModerationService;
use App\Services\UserService;
use App\Services\OrderService;
use App\Services\CheckoutService;
use App\Services\PromoCodeService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // External services
        $this->app->singleton(UnsplashService::class);
        $this->app->singleton(OpenAIModerationService::class);

        // Your app services
        $this->app->singleton(UserService::class);
        $this->app->singleton(OrderService::class);
        $this->app->singleton(PromoCodeService::class);

        // CheckoutService depends on OrderService, PromoCodeService, UserService
        $this->app->singleton(CheckoutService::class, function ($app) {
            return new CheckoutService(
                $app->make(OrderService::class),
                $app->make(PromoCodeService::class),
                $app->make(UserService::class) // if you add UserService as a dependency
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Observers
        User::observe(app(UserObserver::class));
    }
}
