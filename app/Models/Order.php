<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // Enable automatic timestamps (created_at, updated_at)
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'customer_id',
        'cart',
        'returnable_cart',

        'total',
        'subtotal',
        'weight',
        'discount',
        'shipping_cost',
        'delivery_price', // if used

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

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'cart' => 'array',
        'returnable_cart' => 'array',
        'tracking_history' => 'array',
        'shipping_details' => 'array',  // cast JSON shipping details to array

        'legal_agreement' => 'boolean',
        'is_completed' => 'boolean',
        'returnable' => 'boolean',

        'return_finished_at' => 'datetime', // if used
    ];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [
        'created_at',
        'updated_at',
    ];

    /**
     * Determine if the order is returnable.
     */
    public function isReturnable()
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
