<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PromoCodeService;
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
        $request->validate([
            'promoCode' => 'required|string',
        ]);

        $code = $request->input('promoCode');
        $discount = $this->promoCodeService->validate($code);

        if ($discount !== null) {
            session(['promo_discount' => $discount]);

            return response()->json([
                'success'  => true,
                'message'  => 'Promo code applied successfully!',
                'discount' => $discount,
            ]);
        } else {
            session()->forget('promo_discount');

            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code.',
            ], 422);
        }
    }
}
