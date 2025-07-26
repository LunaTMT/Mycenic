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
        'likes',
        'dislikes',
        'rating',
        'item_id',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }

    public function votes()
    {
        return $this->hasMany(ReviewVote::class);
    }

    /**
     * Polymorphic relation: all replies to this review
     */
    public function replies()
    {
        return $this->morphMany(Reply::class, 'replyable')->with('replies');
    }

}
