<?php

namespace App\Http\Controllers\Cart;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Models\Cart\PromoCode; 
use App\Services\Cart\PromoCodeService;
use Illuminate\Support\Facades\Log;

class PromoCodeController extends Controller
{
    protected $promoCodeService;

    public function __construct(PromoCodeService $promoCodeService)
    {
        $this->promoCodeService = $promoCodeService;
    }

    public function validatePromoCode(Request $request)
    {
        Log::info('PromoCodeController@validatePromoCode called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
        ]);

        $request->validate([
            'promo_code' => 'required|string',
        ]);

        $code = $request->input('promo_code');
        $discount = $this->promoCodeService->validate($code);

        if ($discount !== null) {
            session(['promo_discount' => $discount]);

            Log::info('Promo code applied successfully', [
                'code' => $code,
                'discount' => $discount,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Promo code applied successfully!',
                'discount' => $discount,
            ]);
        } else {
            session()->forget('promo_discount');

            Log::warning('Invalid promo code attempt', [
                'code' => $code,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code.',
            ], 422);
        }
    }
}
