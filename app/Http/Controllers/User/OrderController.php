<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Return JSON list of orders.
     * - Regular users: only their own orders
     * - Admins: can fetch any user by passing ?user_id=...
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        $query = Order::with('cart.items')->orderBy('created_at', 'desc');

        if ($request->user_id) {
            // Only admins can fetch another user's orders
            if (auth()->user()->role !== 'admin') {
                abort(403, 'Unauthorized.');
            }
            Log::info('Admin trying to view another user', [
                'admin_id' => auth()->id(),
                'target_user_id' => $request->user_id,
            ]);

            $query->where('user_id', $request->user_id);
        } else {
            // Regular users fetch only their own orders
            $query->where('user_id', Auth::id());
        }

        $orders = $query->get();

        Log::info('Fetched orders', [
            'user_id' => auth()->id(),
            'count' => $orders->count(),
        ]);

        return response()->json($orders);
    }

    /**
     * Return JSON for a single order
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('cart.items');

        return response()->json($order);
    }

    /**
     * Update an order
     */
    public function update(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'tracking_number' => 'nullable|string',
            'payment_status'  => 'nullable|string|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->load('cart.items'),
        ]);
    }

    /**
     * Delete an order
     */
    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }
}
