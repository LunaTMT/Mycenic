<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;

    // If you're using a table name that isn't the plural form of the model name, you can specify it like this:
    // protected $table = 'promo_codes';

    // Define the fillable properties
    protected $fillable = [
        'code', 'discount', 'expires_at',
    ];
}
