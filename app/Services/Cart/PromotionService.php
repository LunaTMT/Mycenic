<?php

namespace App\Services\Cart;

use App\Models\Cart\Promotion;
use Illuminate\Support\Facades\Log;

class PromotionService
{
    /**
     * Validate a promotion code and return the Promotion model if valid.
     *
     * @param string $code
     * @return Promotion|null
     */
    public function validate(string $code): ?Promotion
    {
        Log::info('Checking promotion code in database.', ['promotionCode' => $code]);

        $promotion = Promotion::whereRaw('BINARY `code` = ?', [$code])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->first();

        if ($promotion) {
            Log::info('Promotion validated successfully.', [
                'promotionCode' => $code,
                'discount' => $promotion->discount
            ]);
            return $promotion;
        }

        Log::warning('Invalid or expired promotion code.', ['promotionCode' => $code]);
        return null;
    }
}
