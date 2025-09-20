<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Fetched orders', ['user_id' => Auth::id(), 'count' => $orders->count()]);

        return response()->json(['orders' => $orders]);
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);

        Log::info('Fetched single order', ['user_id' => Auth::id(), 'order_id' => $order->id]);

        return response()->json(['order' => $order]);
    }

    public function update(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'tracking_number' => 'nullable|string',
            'payment_status' => 'nullable|string|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);

        Log::info('Order updated', ['order_id' => $order->id, 'updates' => $validated]);

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        $order->delete();

        Log::info('Order deleted', ['order_id' => $order->id]);

        return response()->json(['success' => true]);
    }
}
