<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'question',
        'is_admin',
        'parent_id',
        'likes',
        'dislikes',
        'is_deleted',
        'category',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'likes' => 'integer',
        'dislikes' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function repliesRecursive()
    {
        return $this->hasMany(Question::class, 'parent_id')
            ->with('user')
            ->with('repliesRecursive')
            ->orderBy('created_at', 'asc');
    }

    public function replies()
    {
        return $this->hasMany(Question::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    public function parent()
    {
        return $this->belongsTo(Question::class, 'parent_id');
    }
}
