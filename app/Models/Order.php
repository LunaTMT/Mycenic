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
        'legalAgreement', 'is_completed', 'returnable' ,'shipping_cost'
    ];

    
    protected $casts = [
        'tracking_history' => 'array',
         'cart' => 'array',
    ];
    

    protected $dates = ['created_at', 'updated_at'];
}
