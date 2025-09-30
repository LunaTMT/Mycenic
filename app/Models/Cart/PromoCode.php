<?php

namespace App\Models\Cart;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;
    
    protected $fillable = ['code', 'discount', 'expires_at'];
    protected $dates = ['expires_at'];

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }
}
