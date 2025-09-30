<?php

namespace App\Models\User;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Cashier\Billable;
use App\Models\Cart\Cart;
use App\Models\{Image, Order, Review};

class User extends Authenticatable
{
    use HasFactory, Notifiable, Billable;

    protected $fillable = [
        'name','email','password','phone','address','city','zip',
        'stripe_id','stripe_status','stripe_subscription_id',
        'google_id','provider','provider_id'
    ];

    protected $visible = [
        'id','name','email','phone','avatar','addresses','is_admin','is_guest','carts'
    ];

    protected $appends = ['is_admin','is_guest'];

    protected $hidden = ['password','remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'password' => 'hashed'
    ];

    protected $with = ['addresses','avatar','carts'];

    /* Relationships */
    public function avatar() { return $this->morphOne(Image::class,'imageable'); }
    public function addresses() { return $this->hasMany(Address::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function carts() { return $this->hasMany(Cart::class); }

    /* Accessors */
    public function getIsAdminAttribute(): bool { return $this->role === 'admin'; }
    public function getIsGuestAttribute(): bool { return $this->id === 0 || $this->role === 'guest'; }


    /* Helpers */
    public function isAdmin(): bool { return $this->getIsAdminAttribute(); }
    public function hasPassword(): bool { return !is_null($this->password); }
    public function isGuest(): bool { return $this->getIsGuestAttribute(); }

    /**
     * Return a guest user instance
     */
    public static function guest(): self
    {
        $guest = new self();
        $guest->id = 0;
        $guest->name = 'Guest';
        $guest->email = '';
        $guest->role = 'guest';
        $guest->phone = null;
        $guest->addresses = collect();
        $guest->avatar = null;

        return $guest;
    }
}
