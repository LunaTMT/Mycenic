<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; // Add this line
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
    ];

    protected $visible = [
        'id',
        'name',
        'email',
        'phone',
        'avatar',
        'addresses',
        'role',
        'is_admin',  // Added here to ensure it's included in the response
    ];

    protected $appends = ['is_admin'];  // Added this line to append the computed is_admin attribute

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'trial_ends_at' => 'datetime',
    ];

    protected $with = ['addresses', 'avatar'];

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

    public function getIsAdminAttribute()
    {
        return $this->role === 'admin';
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
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
