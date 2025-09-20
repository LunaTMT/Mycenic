<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    protected $fillable = ['user_id', 'guest_token', 'vote'];

    public function votable()
    {
        return $this->morphTo();
    }
}
