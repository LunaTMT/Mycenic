<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        Log::info('Checkout request validated', ['validated' => $validated]);

        try {
            $order = $this->checkoutService->process([
                'cart' => $validated['cart'],
                'payment_intent_id' => $validated['payment_intent_id'],
                'email' => $validated['email'],
                'shipping_address' => $validated['shipping_address'] ?? null,
                'promo_code' => $validated['promo_code'] ?? null,
            ]);

            Log::info('Checkout completed successfully', ['order_id' => $order->id]);

            // Flash order_id for the next request
            return redirect()->route('checkout.success')->with('order_id', $order->id);
        } catch (\Exception $e) {
            Log::error('Checkout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('flash.error', 'Checkout failed: ' . $e->getMessage());
        }
    }

    public function success(Request $request)
    {
        $orderId = $request->session()->get('order_id');

        if (!$orderId) {
            Log::warning('No order_id in session on checkout success');
            return redirect()->route('cart')->with('flash.error', 'No order found.');
        }

        Log::info('Checkout success', ['order_id' => $orderId]);

        return redirect()->route('orders.show', ['order' => $orderId]);
    }

    public function cancel(Request $request)
    {
        Log::info('Checkout cancelled', $request->all());
        return redirect()->route('cart');
    }
}
