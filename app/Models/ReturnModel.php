<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnModel extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'order_id',
        'user_id',
        'initiated_at',
        'completed_at',
        'status',
        'items',
        'approved',
        'shipping_option',
        'shipping_status',      
        'payment_status',      
        'shipping_label_url',
        'tracking_number',
        'tracking_url',
        'tracking_history',
        'notes',
    ];


    protected $casts = [
        'items' => 'array',
        'tracking_history' => 'array',
        'initiated_at' => 'datetime',
        'completed_at' => 'datetime',
        'approved' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
