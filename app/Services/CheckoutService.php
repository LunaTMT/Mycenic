<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Illuminate\Support\Facades\Log;

class CheckoutService
{
    protected OrderService $orderService;
    protected PromoCodeService $promoCodeService;
    protected UserService $userService;

    public function __construct(
        OrderService $orderService,
        PromoCodeService $promoCodeService,
        UserService $userService
    ) {
        $this->orderService = $orderService;
        $this->promoCodeService = $promoCodeService;
        $this->userService = $userService;
    }

    public function process(array $data)
    {
        Log::info('Checkout process started', ['request' => $data]);

        // 1️⃣ Validate required data
        if (!isset($data['cart'], $data['payment_intent_id'], $data['email'])) {
            throw new \Exception('Missing required checkout data');
        }

        $cart = $data['cart'];
        $paymentIntentId = $data['payment_intent_id'];
        $email = $data['email'];
        $shippingAddress = $data['shipping_address'] ?? null;
        $promoCode = $data['promo_code'] ?? null;

        // 2️⃣ Validate promo code
        $discountPercent = 0;
        if ($promoCode) {
            $discountPercent = $this->promoCodeService->validate($promoCode);
        }

        // 3️⃣ Calculate totals
        $subtotalCents = $this->calculateSubtotalCents($cart);
        $discountCents = intval(round($subtotalCents * ($discountPercent / 100)));
        $shippingCents = intval(round(($cart['shipping_cost'] ?? 0) * 100));
        $totalCents = $subtotalCents - $discountCents + $shippingCents;
        $weight = $this->calculateWeight($cart);

        Log::info('Cart totals calculated', [
            'subtotal_cents' => $subtotalCents,
            'discount_cents' => $discountCents,
            'shipping_cents' => $shippingCents,
            'total_cents' => $totalCents,
            'weight' => $weight
        ]);

        // 4️⃣ Verify Stripe payment
        $this->verifyPayment($paymentIntentId, $totalCents);

        // 5️⃣ Find or create user
        $user = $this->userService->findOrCreate([
            'email' => $email,
            'name' => $data['name'] ?? null,
        ]);

        Log::info('User resolved for checkout', ['user_id' => $user->id, 'email' => $email]);

        // 6️⃣ Create order
        $order = $this->orderService->create([
            'user_id' => $user->id,
            'email' => $email,
            'cart' => $cart,
            'subtotal' => $subtotalCents / 100,
            'total' => $totalCents / 100,
            'weight' => $weight,
            'shipping_address' => $shippingAddress,
            'payment_intent_id' => $paymentIntentId,
            'discount' => $discountCents / 100,
        ]);

        Log::info('Order created successfully', [
            'order_id' => $order->id,
            'user_id' => $user->id,
            'total' => $order->total
        ]);

        return $order;
    }

    protected function verifyPayment(string $paymentIntentId, int $amountCents)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

        if ($paymentIntent->status !== 'succeeded') {
            throw new \Exception("Payment not completed. Status: {$paymentIntent->status}");
        }

        if ($paymentIntent->amount_received !== $amountCents) {
            throw new \Exception("Payment amount mismatch. Expected {$amountCents}, got {$paymentIntent->amount_received}");
        }

        Log::info("Stripe payment verified: {$paymentIntentId}, amount: {$amountCents}");
    }

    protected function calculateSubtotalCents(array $cart): int
    {
        $subtotal = 0;
        foreach ($cart['items'] ?? $cart as $item) {
            $priceCents = intval(round(($item['item']['price'] ?? $item['price'] ?? 0) * 100));
            $quantity = $item['quantity'] ?? 1;
            $subtotal += $priceCents * $quantity;
        }
        return $subtotal;
    }

    protected function calculateWeight(array $cart): float
    {
        $weight = 0;
        foreach ($cart['items'] ?? $cart as $item) {
            $itemWeight = $item['item']['weight'] ?? $item['weight'] ?? 0;
            $quantity = $item['quantity'] ?? 1;
            $weight += $itemWeight * $quantity;
        }
        return $weight;
    }
}
