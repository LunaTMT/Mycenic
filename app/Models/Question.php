<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'user_id',
        'question',
        'date',
        'is_admin',
        'parent_id',
        'likes',
        'dislikes',
        'is_deleted', 
        'category'
    ];
    protected $casts = [
        'date' => 'datetime',
        'is_admin' => 'boolean',
        'likes' => 'integer',
        'dislikes' => 'integer',
    ];

    // Relationship to the user who asked the question
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Recursive replies relationship, eager loads user and nested replies
    public function repliesRecursive()
    {
        return $this->hasMany(Question::class, 'parent_id')
                    ->with('user')
                    ->with('repliesRecursive')
                    ->orderBy('date', 'asc');
    }

    // Direct replies only
    public function replies()
    {
        return $this->hasMany(Question::class, 'parent_id')->orderBy('date', 'asc');
    }

    // Parent question relationship
    public function parent()
    {
        return $this->belongsTo(Question::class, 'parent_id');
    }
}
