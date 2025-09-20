<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnModel extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'order_id',
        'user_id',
        'customer_id',
        'customer_name',
        'address',
        'city',
        'zip',
        'country',
        'phone',
        'email',
        'initiated_at',
        'completed_at',
        'status',
        'items',
        'approved',
        'shipping_option',
        'shipping_status',
        'carrier',
        'label_url',
        'shipment_id',
        'tracking_number',
        'tracking_url',
        'tracking_history',
        'subtotal',
        'total',
        'discount',
        'shipping_cost',
        'weight',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'items'            => 'array',
        'shipping_option'  => 'array', 
        'tracking_history' => 'array',
        'initiated_at'     => 'datetime',
        'completed_at'     => 'datetime',
        'approved'         => 'boolean',
        'subtotal'         => 'decimal:2',
        'total'            => 'decimal:2',
        'discount'         => 'decimal:2',
        'shipping_cost'    => 'decimal:2',
        'weight'           => 'decimal:2',
    ];


    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    
}
