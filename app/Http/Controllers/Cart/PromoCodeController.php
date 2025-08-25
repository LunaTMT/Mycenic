<?php

namespace App\Http\Controllers\Cart;
use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth; // Make sure to include Auth
use Inertia\Inertia;

class PromoCodeController extends Controller
{
    public function validatePromoCode(Request $request)
    {
        // Log the request input
        Log::info('Promo code validation request received.', ['request' => $request->all()]);

        // Validate the promo code input
        $request->validate([
            'promoCode' => 'required|string',
        ]);

        $promoCode = $request->input('promoCode');

        // Log the input promo code
        Log::info('Checking promo code in database.', ['promoCode' => $promoCode]);

        // Check if promo code exists
        $promo = PromoCode::whereRaw('BINARY `code` = ?', [$promoCode])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>=', now());
            })
            ->first();

        if ($promo) {
            // Promo code valid
            Log::info('Promo code validated successfully.', [
                'promoCode' => $promoCode,
                'discount' => $promo->discount
            ]);

            $user = Auth::user();
            return Inertia::render('Shop/Cart/Cart', [
                'auth' => $user,
                'shippingDetails' => session('shipping_details'),
                'success' => true,
                'discount' => $promo->discount,
                'flash.success' => 'Promo code applied successfully!',
            ]);
        } else {
            // Promo code invalid or expired
            Log::warning('Invalid or expired promo code.', ['promoCode' => $promoCode]);

            // Redirect to the cart with a message and any relevant data
            return redirect()->route('cart')->with([
                'promoCode' => $promoCode,
                'discount' => null,
                'flash.error' => 'Invalid promo code.',
            ]);
        }
    }
}