<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'user_id',
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
        'payment_status',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class)->with('items.item');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
