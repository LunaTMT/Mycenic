<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'country',
        'full_name',
        'phone',
        'zip',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'is_default',
        'delivery_instructions',
    ];

    /**
     * The user this address belongs to (optional).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
