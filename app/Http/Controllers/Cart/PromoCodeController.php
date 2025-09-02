<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PromoCodeController extends Controller
{
    public function validatePromoCode(Request $request)
    {
        Log::info('Promo code validation request received.', ['request' => $request->all()]);

        $request->validate([
            'promoCode' => 'required|string',
        ]);

        $promoCode = $request->input('promoCode');

        Log::info('Checking promo code in database.', ['promoCode' => $promoCode]);

        $promo = PromoCode::whereRaw('BINARY `code` = ?', [$promoCode])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->first();

        if ($promo) {
            session(['promo_discount' => $promo->discount]);

            Log::info('Promo code validated successfully.', [
                'promoCode' => $promoCode,
                'discount' => $promo->discount
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Promo code applied successfully!',
                'discount' => $promo->discount,
            ]);
        } else {
            session()->forget('promo_discount');

            Log::warning('Invalid or expired promo code.', ['promoCode' => $promoCode]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code.',
            ], 422);
        }
    }
}
