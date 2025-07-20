<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewVote extends Model
{
    protected $fillable = ['user_id', 'guest_token', 'review_id', 'vote'];

    // Add any relationships or methods if needed
}
