<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

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
        'price' => 'float',
        'weight' => 'float',
        'stock' => 'integer',
    ];

    // Append computed attributes if needed
    protected $appends = ['average_rating', 'reviews_count', 'thumbnail'];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function topLevelReviews()
    {
        return $this->hasMany(Review::class)->whereNull('parent_id');
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->topLevelReviews()->avg('rating') ?? 0, 2);
    }

    public function getReviewsCountAttribute(): int
    {
        if (array_key_exists('reviews_count', $this->attributes)) {
            return (int) $this->attributes['reviews_count'];
        }
        return $this->topLevelReviews()->count();
    }

    public function getThumbnailAttribute(): ?string
    {
        return $this->images()->value('path');
    }
}
