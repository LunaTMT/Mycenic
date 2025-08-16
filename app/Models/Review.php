<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'content', 'likes', 'dislikes', 'rating', 'item_id', 'parent_id',
    ];

    // Parent review
    public function parent()
    {
        return $this->belongsTo(Review::class, 'parent_id');
    }

    // Direct children (replies) - safe for one level
    public function replies()
    {
        return $this->hasMany(Review::class, 'parent_id')
            ->with(['user.avatar', 'images', 'replies']); // include avatar
    }

    // User who wrote the review
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Related item
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // Review images
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    // Votes for the review
    public function votes()
    {
        return $this->morphMany(Vote::class, 'votable');
    }
}
