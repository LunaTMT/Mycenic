<?php

namespace App\Services\Cart;

use App\Models\Cart\PromoCode;
use Illuminate\Support\Facades\Log;

class PromoCodeService
{
    /**
     * Validate a promo code and return the discount if valid.
     *
     * @param string $code
     * @return float|null
     */
    public function validate(string $code): ?float
    {
        Log::info('Checking promo code in database.', ['promoCode' => $code]);

        $promo = PromoCode::whereRaw('BINARY `code` = ?', [$code])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->first();

        if ($promo) {
            Log::info('Promo code validated successfully.', [
                'promoCode' => $code,
                'discount' => $promo->discount
            ]);
            return $promo->discount;
        }

        Log::warning('Invalid or expired promo code.', ['promoCode' => $code]);
        return null;
    }
}
