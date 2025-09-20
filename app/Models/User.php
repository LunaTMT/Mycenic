<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, Billable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'zip',
        'stripe_id',
        'stripe_status',
        'stripe_subscription_id',
        'google_id',
        'provider',
        'provider_id',
        // removed 'avatar'
    ];

    protected $visible = [
        'id',
        'name',
        'email',
        'phone',    
        'avatar',
        'shippingDetails',
        'role'
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'trial_ends_at' => 'datetime',
    ];



    public function hasPassword(): bool
    {
        return !is_null($this->password);
    }

    public function avatar()
    {
        return $this->morphOne(Image::class, 'imageable');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }


    public function shippingDetails()
    {
        return $this->hasMany(ShippingDetail::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }


}
