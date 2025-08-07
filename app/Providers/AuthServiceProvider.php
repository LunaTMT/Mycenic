<?php

namespace App\Providers;

use App\Models\ShippingDetail;
use App\Policies\ShippingDetailPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        ShippingDetail::class => ShippingDetailPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
