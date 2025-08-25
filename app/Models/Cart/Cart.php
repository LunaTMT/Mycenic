<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_id',
        'subtotal',
        'total',
    ];

    // Registered user (nullable)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Cart items
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    // Helper to determine owner type
    public function isGuest(): bool
    {
        return $this->guest_id !== null;
    }
}
