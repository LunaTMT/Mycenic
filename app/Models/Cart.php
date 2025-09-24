<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cart extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'subtotal',
        'total',
        'discount',
        'shipping_cost',
        'status',
    ];

    // Eager load items and related products for frontend
    protected $with = ['items.item'];

    /**
     * Items in this cart
     */
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * User that owns this cart
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for only active cart
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Calculate subtotal from items
     */
    public function calculateSubtotal(): float
    {
        return $this->items->sum(fn($item) => $item->quantity * $item->item->price);
    }

    /**
     * Calculate total including discount & shipping
     */
    public function calculateTotal(): float
    {
        $subtotal = $this->calculateSubtotal();
        $discount = $this->discount ?? 0;
        $shipping = $this->shipping_cost ?? 0;

        return $subtotal - $discount + $shipping;
    }
}
