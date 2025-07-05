<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category',
        'weight',
        'images',
        'stripe_product_id',
        'stripe_price_id',
        'isPsyilocybinSpores',
        'image_sources',        
        'options',
    ];
}
