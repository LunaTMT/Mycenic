<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = ['imageable_id','imageable_type','path'];

    // hide technical fields from JSON/API
    protected $hidden = ['imageable_id', 'imageable_type', 'created_at', 'updated_at'];

    public function imageable()
    {
        return $this->morphTo();
    }
}
