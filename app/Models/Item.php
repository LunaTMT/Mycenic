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
        'stripe_product_id',
        'stripe_price_id',
        'isPsyilocybinSpores',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
        'isPsyilocybinSpores' => 'boolean',
        'price' => 'decimal:2',
        'weight' => 'float',
        'stock' => 'integer',
    ];

    // Append only average_rating
    protected $appends = ['average_rating'];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }



    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 2);
    }
}
