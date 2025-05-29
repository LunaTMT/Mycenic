<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    // ✅ Enable timestamps
    public $timestamps = true;

    protected $fillable = [
        'user_id', 'cart', 'total', 'subtotal', 'weight', 'payment_status',
        'customer_name', 'address', 'city', 'zip', 'country', 'phone', 'email',
        'shipping_status', 'tracking_number', 'tracking_url', 'discount', 'carrier', 'tracking_history',
        'legal_agreement', 'is_completed', 'returnable', 'shipping_cost', 'delivery_price',
    ];

    protected $casts = [
        'tracking_history' => 'array',
        'cart' => 'array',
        'return_items' => 'array',
        'return_tracking_history' => 'array',
        'return_finished_at' => 'datetime',
        'legal_agreement' => 'boolean',
        'is_completed' => 'boolean',
        'returnable' => 'boolean',
    ];



    protected $dates = ['created_at', 'updated_at'];
}
