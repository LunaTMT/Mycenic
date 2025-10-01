<?php

namespace App\Models\Cart;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Item;

class CartItem extends Model
{
    use HasFactory;

    public $timestamps = false; // Disable timestamps

    protected $fillable = ['cart_id', 'item_id', 'quantity', 'selected_options'];

    protected $casts = [
        'selected_options' => 'array',
    ];

    protected $hidden = ['cart_id']; // Hide cart_id from JSON

    public function cart() { return $this->belongsTo(Cart::class); }
    public function item() { return $this->belongsTo(Item::class); }

    protected static function booted()
    {
        static::saved(fn($cartItem) => $cartItem->cart->recalculateTotals());
        static::deleted(fn($cartItem) => $cartItem->cart->recalculateTotals());
    }
}
