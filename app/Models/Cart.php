<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cart extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'subtotal', 'total', 'discount', 'shipping_cost', 'status', 'weight'];

    protected $with = ['items.item'];

    public function items() { return $this->hasMany(CartItem::class); }
    public function user() { return $this->belongsTo(User::class); }

    public function recalculateTotals(): void
    {
        $this->subtotal = $this->items->sum(fn($i) => $i->quantity * $i->item->price);
        $this->weight = $this->items->sum(fn($i) => $i->quantity * $i->item->weight);
        $this->shipping_cost = $this->calculateShippingCost($this->weight);
        $this->total = $this->subtotal - ($this->discount ?? 0) + $this->shipping_cost;
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
