<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email', // add this
        'cart',
        'returnable_cart',
        'total',
        'subtotal',
        'weight',
        'discount',
        'shipping_cost',
        'payment_status',
        'shipping_details',
        'shipping_status',
        'carrier',
        'tracking_number',
        'tracking_url',
        'tracking_history',
        'label_url',
        'shipment_id',
        'legal_agreement',
        'is_completed',
        'returnable',
        'return_status',
    ];


    protected $casts = [
        'cart' => 'array',
        'returnable_cart' => 'array',
        'tracking_history' => 'array',
        'shipping_details' => 'array',
        'legal_agreement' => 'boolean',
        'is_completed' => 'boolean',
        'returnable' => 'boolean',
        'return_finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isReturnable(): bool
    {
        return $this->returnable && strcasecmp($this->shipping_status, 'DELIVERED') === 0;
    }

    protected static function booted()
    {
        static::creating(function ($order) {
            if (is_null($order->returnable_cart) && $order->cart) {
                $order->returnable_cart = $order->cart;
            }
        });
    }
}
