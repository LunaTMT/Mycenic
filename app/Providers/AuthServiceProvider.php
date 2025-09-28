<?php

namespace App\Providers;


use App\Policies\OrderPolicy;
use App\Policies\ShippingDetailPolicy;
use App\Policies\ItemPolicy;
use App\Policies\AddressPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        
        Order::class => OrderPolicy::class, 
        Item::class => ItemPolicy::class,
        Cart::class => CartPolicy::class,
        User::class => UserPolicy::class,
        Address::class => AddressPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
