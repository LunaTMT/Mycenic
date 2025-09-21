<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;


class CheckoutController extends Controller
{
    protected CheckoutService $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function process(Request $request)
    {
        Log::info('Checkout process started', ['request' => $request->all()]);

        $validated = $request->validate([
            'cart' => 'required|array',
            'payment_intent_id' => 'required|string',
            'email' => 'required|email',
            'shipping_address' => 'nullable|array',
            'promo_code' => 'nullable|string',
        ]);

        try {
            $order = $this->checkoutService->process([
                'cart' => $validated['cart'],
                'payment_intent_id' => $validated['payment_intent_id'],
                'email' => $validated['email'],
                'shipping_address' => $validated['shipping_address'] ?? null,
                'promo_code' => $validated['promo_code'] ?? null,
            ]);

            Log::info('Process Method: Checkout completed successfully', [
                'order_id' => $order->id,
                'email' => $order->email, // correctly log email
            ]);

            return redirect()->route('checkout.success', [
                'order' => $order->id,
                'email' => $order->email, // will become query string ?email=...
            ]);

        } catch (\Exception $e) {
            Log::error('Checkout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('flash.error', 'Checkout failed: ' . $e->getMessage());
        }
    }

    public function success($order, Request $request)
    {
        $email = $request->query('email'); // from URL query

        Log::info('Checkout success', ['order_id' => $order, 'email' => $email]);

        if (Auth::check()) {
            return redirect()->route('orders.show', ['order' => $order]);
        }

        return Inertia::render('Checkout/GuestSuccess', [
            'order_id' => $order,
            'email' => $email,
        ]);
    }



    public function cancel(Request $request)
    {
        Log::info('Checkout cancelled', $request->all());
        return redirect()->route('cart');
    }
}
