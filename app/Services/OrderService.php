<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * Create a new order for a cart
     */
    public function create(array $data): Order
    {
        // Expect $data to include 'cart_id' and 'user_id'
        $order = Order::create([
            'user_id' => $data['user_id'] ?? null,
            'cart_id' => $data['cart']['id'] ?? null, // get id from cart array
            'payment_status' => $data['payment_status'] ?? 'paid',
            'shipping_status' => $data['shipping_status'] ?? 'PRE-TRANSIT',
            'legal_agreement' => $data['legal_agreement'] ?? true,
            'is_completed' => $data['is_completed'] ?? false,
            'returnable' => $data['returnable'] ?? true,
            'return_status' => $data['return_status'] ?? 'UNKNOWN',
            'carrier' => $data['carrier'] ?? null,
            'tracking_number' => $data['tracking_number'] ?? null,
            'tracking_url' => $data['tracking_url'] ?? null,
            'tracking_history' => $data['tracking_history'] ?? null,
            'label_url' => $data['label_url'] ?? null,
            'shipment_id' => $data['shipment_id'] ?? null,
            'orderNote' => $data['cart']['orderNote'] ?? null, // <-- add this
        ]);

        Log::info('Order created via OrderService', ['order' => $order]);

        return $order;
    }

    /**
     * Fetch orders for a specific user with cart items
     */
    public function fetchForUser(int $userId)
    {
        return Order::where('user_id', $userId)
                    ->with('cart.items') // include items for frontend
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Update payment status
     */
    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['payment_status' => $status]);
        return $order;
    }
}
