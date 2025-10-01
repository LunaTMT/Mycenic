<?php

namespace App\Models\Cart;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\HasGroupedAttributes;

class Cart extends Model
{
    use HasFactory, SoftDeletes, HasGroupedAttributes;

    protected $fillable = [
        'user_id', 'subtotal', 'total', 'shipping_cost', 'status', 'weight', 'promotion_id'
    ];

    protected $hidden = [
        'user_id', 'promotion_id', 'subtotal', 'total', 'shipping_cost', 'weight', 'created_at', 'updated_at', 'deleted_at'
    ];

    protected $with = ['items.item', 'promotion'];

    protected $casts = [
        'subtotal' => 'float',
        'total' => 'float',
        'shipping_cost' => 'float',
        'weight' => 'float',
    ];

    protected $appends = ['timestamps', 'amounts'];

    protected $numericFields = ['subtotal', 'total', 'shipping_cost', 'weight'];

    // Relationships
    public function items() { return $this->hasMany(CartItem::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }

    // Dynamic discount
    public function getDiscountAmountAttribute(): float
    {
        if (!$this->promotion || ($this->promotion->expires_at && $this->promotion->expires_at < now())) {
            return 0;
        }
        return $this->subtotal * ($this->promotion->discount / 100);
    }

    // Recalculate totals
    public function recalculateTotals(): void
    {
        $this->subtotal = $this->items->sum(fn($i) => $i->quantity * $i->item->price);
        $this->weight = $this->items->sum(fn($i) => $i->quantity * $i->item->weight);
        $this->shipping_cost = $this->calculateShippingCost($this->weight);
        $this->total = $this->subtotal - $this->discount_amount + $this->shipping_cost;
        $this->save();
    }

    private function calculateShippingCost(float $weight): float
    {
        return match (true) {
            $weight <= 0 => 0,
            $weight <= 1 => 5.00,
            $weight <= 5 => 10.00,
            default => 20.00,
        };
    }
}
