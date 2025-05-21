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

    public function index(Request $request)
    {
        Log::info("Payment controller");

        // Get the logged-in user or handle as a guest
        $user = Auth::user();
        
        // Retrieve the amount (in cents) from the request
        $amount = (int) round($request->input('amount') * 100); // Example: 40.00 becomes 4000

        Log::info("Amount to be paid: " . $amount);

        // Set Stripe API key
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            // Create a PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'gbp',
                'metadata' => [
                    'user_id' => $user ? $user->id : 'guest',
                    'cart_id' => session()->getId(),
                ],
            ]);

            Log::info('Stripe PaymentIntent created', [
                'id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'payment intent' => $paymentIntent,
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'message' => $e->getMessage(),
            ]);

            return redirect()->route('cart')->withErrors(['error' => 'Payment initialization failed.']);
        }

        return Inertia::render('Shop/Cart/Payment/PaymentPage', [
            'paymentIntentClientSecret' => $paymentIntent->client_secret,
            'auth' => [
                'user' => $user,
            ],
        ]);

    }

    
    
    

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
        $request->validate([
            'amount' => 'required|integer|min:1', // amount in cents
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $user = Auth::user();
            $amount = $request->input('amount');

            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'gbp',
                'metadata' => [
                    'user_id' => $user ? $user->id : 'guest',
                    'cart_id' => session()->getId(),
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            \Log::error('Stripe PaymentIntent creation failed', ['message' => $e->getMessage()]);

            return response()->json([
                'error' => 'Payment initialization failed.',
            ], 500);
        }
    }


  
}
