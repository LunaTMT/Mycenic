<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Create a new order
     */
    public function create(array $data): Order
    {
        $order = Order::create([
            'user_id' => $data['user_id'],
            'email' => $data['email'],
            'cart' => json_encode($data['cart']),
            'subtotal' => $data['subtotal'],
            'total' => $data['total'],
            'weight' => $data['weight'],
            'payment_status' => $data['payment_status'] ?? 'paid',
            'tracking_number' => $data['tracking_number'] ?? null,
            'shipping_address' => $data['shipping_address'] ?? null,
            'payment_intent_id' => $data['payment_intent_id'] ?? null,
            'discount' => $data['discount'] ?? 0,
        ]);

        Log::info('Order created via OrderService', ['order_id' => $order->id]);

        return $order;
    }

    /**
     * Fetch orders for a specific user
     */
    public function fetchForUser(int $userId)
    {
        return Order::where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Update order status
     */
    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['payment_status' => $status]);
        return $order;
    }
}
