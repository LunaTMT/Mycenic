<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\ShippingDetail;
use App\Policies\OrderPolicy;
use App\Policies\ShippingDetailPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        ShippingDetail::class => ShippingDetailPolicy::class,
        Order::class => OrderPolicy::class, // <-- added OrderPolicy
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
