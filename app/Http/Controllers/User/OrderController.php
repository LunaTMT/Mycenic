<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the user's orders in profile with orders tab active
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Fetched orders', ['user_id' => Auth::id(), 'count' => $orders->count()]);

        return Inertia::render('Profile', [
            'activeTab' => 'orders',   // for showing orders tab
            'orders'    => $orders,
        ]);
    }

    /**
     * Display a single order in profile with orders tab active
     */
    public function show(Order $order): Response
    {
        $this->authorize('view', $order);

        Log::info('Fetched single order', ['user_id' => Auth::id(), 'order_id' => $order->id]);

        return Inertia::render('Profile', [
            'activeTab' => 'orders',
            'orders'    => [$order], // pass as array so the tab can display a list
            'selectedOrder' => $order, // optional if you want to highlight/show detail
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validated = $request->validate([
            'tracking_number' => 'nullable|string',
            'payment_status'  => 'nullable|string|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);

        Log::info('Order updated', ['order_id' => $order->id, 'updates' => $validated]);

        return redirect()->back()->with('flash.success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        $order->delete();

        Log::info('Order deleted', ['order_id' => $order->id]);

        return redirect()->back()->with('flash.success', 'Order deleted successfully.');
    }
}
