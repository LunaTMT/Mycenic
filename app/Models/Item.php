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

    /**
     * All reviews (including replies).
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Only top-level reviews (exclude replies).
     */
    public function topLevelReviews()
    {
        return $this->hasMany(Review::class)->whereNull('parent_id');
    }

    /**
     * Images for the item.
     */
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    /**
     * Average rating calculated from top-level reviews only.
     */
    public function getAverageRatingAttribute(): float
    {
        return round($this->topLevelReviews()->avg('rating') ?? 0, 2);
    }
}
