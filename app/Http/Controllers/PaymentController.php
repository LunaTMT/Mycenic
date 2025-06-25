<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use Stripe\Stripe;
use Stripe\PaymentIntent;


class PaymentController extends Controller
{

    
// PaymentController.php

   

    
    
    

   // Create and return PaymentIntent details
    public function get(Request $request)
    {
        Log::info("Payment controller   get");
        $request->validate([
            'paymentIntentId' => 'required|string',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            // Retrieve the payment intent details using the ID
            $paymentIntent = PaymentIntent::retrieve($request->input('paymentIntentId'));

            \Log::info('Stripe PaymentIntent retrieved', [
                'id' => $paymentIntent->id,
            ]);

            return response()->json([
                'paymentIntent' => $paymentIntent,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve Stripe PaymentIntent', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to retrieve payment details.',
            ], 400);
        }
    }

    // Store payment confirmation info after successful payment
    public function store(Request $request)
    {
        Log::info("Payment controller store");

        $request->validate([
            'paymentIntentId' => 'required|string',
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::retrieve($request->input('paymentIntentId'));

            if ($paymentIntent->status === 'succeeded') {
                \Log::info('Payment succeeded', [
                    'paymentIntentId' => $paymentIntent->id,
                    'amount' => $paymentIntent->amount_received,
                ]);

                // Store order, etc.

                return response()->json([
                    'message' => 'Payment successful',
                ]);
            }

            return response()->json([
                'error' => 'Payment was not successful.',
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Failed to process payment info', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Payment verification failed.',
            ], 400);
        }
    }
    public function createPaymentIntent(Request $request)
    {
        \Log::info('createPaymentIntent called', ['request_data' => $request->all()]);

        $request->validate([
            'amount' => 'required|integer|min:1', // amount in cents
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $user = Auth::user();
            $amount = $request->input('amount');

            \Log::info('Creating PaymentIntent', [
                'user_id' => $user ? $user->id : 'guest',
                'amount' => $amount,
                'session_id' => session()->getId(),
            ]);

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'gbp',
                'metadata' => [
                    'user_id' => $user ? $user->id : 'guest',
                    'cart_id' => session()->getId(),
                ],
            ]);

            \Log::info('PaymentIntent created successfully', [
                'payment_intent_id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe PaymentIntent creation failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Payment initialization failed.',
            ], 500);
        }
    }



  
}
