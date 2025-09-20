<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    // Create PaymentIntent
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1', // in pence
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount,
                'currency' => 'gbp',
                'metadata' => [
                    'user_id' => Auth::id() ?: 'guest',
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to initialize payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Final checkout process
    public function processCheckout(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'required|array',
            'payment_intent_id' => 'required|string',
            'email' => 'required|email',
            'shipping_address' => 'nullable|array',
            'promo_code' => 'nullable|string',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'error' => 'Payment not completed.',
                ], 400);
            }

            // TODO: Save order in DB
            return response()->json([
                'order_id' => rand(1000, 9999), // placeholder for now
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Payment verification failed: ' . $e->getMessage(),
            ], 400);
        }
    }
}
