<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

use App\Models\User\User;
use App\Observers\UserObserver;

use App\Services\UnsplashService;
use App\Services\OpenAIModerationService;


use App\Services\User\UserService;
use App\Services\User\UserContextService;

use App\Services\Order\OrderService;

use App\Services\Cart\CartService;
use App\Services\Cart\CheckoutService;
use App\Services\Cart\PromoCodeService;


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
        $this->app->singleton(UserContextService::class);
        $this->app->singleton(OrderService::class);
        $this->app->singleton(PromoCodeService::class);

        $this->app->singleton(CheckoutService::class);
        $this->app->singleton(CartService::class);
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
