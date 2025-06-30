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

        // Validate input
        try {
            $validated = $request->validate([
                'cart' => 'required|json',
                'total' => 'required|numeric|min:0',
                'subtotal' => 'required|numeric|min:0',
                'weight' => 'required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0',
                'shippingCost' => 'required|numeric|min:0',
                'shippingDetails' => 'required|array',  // Ensure it's an array
                'paymentIntentId' => 'required|string',
                'selectedShippingRate' => 'required|array',  // Ensure it's an array
                'selectedShippingRate.amount' => 'required|string',
                'selectedShippingRate.provider' => 'required|string',
                'selectedShippingRate.service' => 'required|string',
                'legalAgreement' => 'nullable|boolean',
            ]);
            $this->log('info', 'Validation successful', $validated);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            $this->log('error', 'Validation failed', $ve->errors());
            return back()->with('flash.error', 'Validation error: ' . json_encode($ve->errors()));
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            // Retrieve Payment Intent using the ID from the request
            $intent = PaymentIntent::retrieve($validated['paymentIntentId']);
            $this->log('info', 'PaymentIntent retrieved', ['id' => $intent->id, 'status' => $intent->status]);

            if ($intent->status !== 'succeeded') {
                $this->log('error', 'PaymentIntent not successful', [
                    'id' => $intent->id,
                    'status' => $intent->status,
                ]);
                return back()->with('flash.error', 'Payment did not complete. Please try again.');
            }

            $charge = $intent->charges->data[0] ?? null;
            $this->log('info', 'Payment charge details', ['charge' => $charge]);

            // Storing session data for checkout
            $this->log('info', 'Storing session data for checkout', [
                'cart' => json_decode($validated['cart'], true),
                'total' => $validated['total'],
                'subtotal' => $validated['subtotal'],
                'weight' => $validated['weight'],
                'discount' => $validated['discount'],
                'shippingCost' => $validated['shippingCost'],
                'shippingDetails' => $validated['shippingDetails'],
                'selectedShippingRate' => $validated['selectedShippingRate'],
            ]);

            // Store data in session
            session([
                'cart'                 => json_decode($validated['cart'], true),
                'total'                => $validated['total'],
                'subtotal'             => $validated['subtotal'],
                'weight'               => $validated['weight'],
                'discount'             => $validated['discount'],
                'shippingCost'         => $validated['shippingCost'],
                'shippingDetails'      => $validated['shippingDetails'],
                'payment_intent_id'    => $intent->id,
                'payment_method'       => $intent->payment_method ?? 'card',
                'payment_provider'     => 'Stripe',
                'payment_completed_at' => now(),
                'payment_last4'        => $charge?->payment_method_details?->card?->last4 ?? null,
                'payment_receipt_url'  => $charge?->receipt_url ?? null,
                'selectedShippingRate' => $validated['selectedShippingRate'],
            ]);

            // Check if legal agreement was provided and store it in the session
            if (isset($validated['legalAgreement'])) {
                session(['legalAgreement' => $validated['legalAgreement']]);
                $this->log('info', 'Legal agreement stored in session', ['legalAgreement' => $validated['legalAgreement']]);
            }

            // Complete the checkout process successfully
            $this->log('info', 'Checkout process completed successfully');
            return redirect()->route('checkout.success');
        } catch (\Exception $e) {
            // Log error and return error message
            $this->log('error', 'Checkout process failed', ['error' => $e->getMessage()]);
            return back()->with('flash.error', 'Checkout process failed: ' . $e->getMessage());
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
