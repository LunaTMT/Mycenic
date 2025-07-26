<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reply extends Model
{
    use HasFactory;

    protected $fillable = [
        'content', 'user_id', 'likes', 'dislikes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replyable()
    {
        return $this->morphTo();
    }

    public function images()
    {
        return $this->hasMany(ReplyImage::class);
    }
   

    public function replies()
    {
        return $this->morphMany(Reply::class, 'replyable')->with('replies');
    }

}
