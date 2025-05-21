<?php
// app/Http/Controllers/CheckoutController.php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    private function log($level, $message, array $context = [])
    {
        Log::$level('CheckoutController: ' . $message, $context);
    }

    public function process(Request $request)
    {
        $this->log('info', 'Checkout process started', $request->all());

        // Log expected fields including legalAgreement
        Log::info('Incoming checkout request data:', [
            'total' => $request->input('total'),
            'subtotal' => $request->input('subtotal'),
            'weight' => $request->input('weight'),
            'discount' => $request->input('discount'),
            'shippingDetails' => $request->input('shippingDetails'),
            'paymentIntentId' => $request->input('paymentIntentId'),
            'legalAgreement' => $request->input('legalAgreement'), // new line
        ]);

        // Validate input, legalAgreement is optional but must be boolean if present
        $validated = $request->validate([
            'cart' => 'required|json',
            'total' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'weight' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'shippingDetails' => 'required|array',
            'paymentIntentId' => 'required|string',
            'legalAgreement' => 'nullable|boolean',
        ]);

        // Confirm PaymentIntent succeeded
        Stripe::setApiKey(env('STRIPE_SECRET'));
        try {
            $intent = PaymentIntent::retrieve($validated['paymentIntentId']);

            if ($intent->status !== 'succeeded') {
                $this->log('error', 'PaymentIntent not successful', [
                    'id' => $intent->id,
                    'status' => $intent->status,
                ]);
                return Inertia::render('Shop', [
                    'flash.error' => 'Payment did not complete. Please try again.'
                ]);
            }

            // Store relevant data in session
            session([
                'cart' => json_decode($validated['cart'], true),
                'total' => $validated['total'],
                'subtotal' => $validated['subtotal'],
                'weight' => $validated['weight'],
                'discount' => $validated['discount'],
                'shippingDetails' => $validated['shippingDetails'],
            ]);

            // Save legalAgreement only if it's present
            if (isset($validated['legalAgreement'])) {
                session(['legalAgreement' => $validated['legalAgreement']]);
            }

            return redirect()->route('checkout.success');

        } catch (\Exception $e) {
            $this->log('error', 'Checkout process failed', ['error' => $e->getMessage()]);
            return Inertia::render('Shop', [
                'flash.error' => 'There was a problem processing your payment. Please try again.'
            ]);
        }
    }


    public function success(Request $request)
    {
        $this->log('info', 'Checkout success request received');
        return redirect()->route('orders.create');
    }

    public function cancel(Request $request)
    {
        $this->log('info', 'Checkout cancel request received', ['request_data' => $request->all()]);
        return redirect()->route('cart');
    }
}
