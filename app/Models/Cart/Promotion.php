<?php

namespace App\Models\Cart;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\HasGroupedAttributes;

class Promotion extends Model
{
    use HasFactory, HasGroupedAttributes;

    protected $fillable = ['code', 'discount', 'expires_at'];

    protected $casts = [
        'discount' => 'float',
        'expires_at' => 'datetime',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
        'expires_at', 
    ];


    protected $appends = ['timestamps'];

    
}
