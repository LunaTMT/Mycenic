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

    public function parent()
    {
        return $this->belongsTo(Review::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Review::class, 'parent_id')
            ->with(['user', 'images', 'replies']);
    }

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
        return $this->morphMany(Image::class, 'imageable');
    }

    public function votes()
    {
        return $this->morphMany(Vote::class, 'votable');
    }
}
