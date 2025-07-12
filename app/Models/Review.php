<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'category',
        'likes',
        'dislikes',
        'parent_id',
        'rating',
        'item_id',   // make sure this is fillable if you use it
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(Review::class, 'parent_id');
    }

    public function repliesRecursive()
    {
        return $this->hasMany(Review::class, 'parent_id')
            ->with(['user', 'repliesRecursive', 'images']);
    }

    public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }

    public function parent()
    {
        return $this->belongsTo(Review::class, 'parent_id');
    }
}
