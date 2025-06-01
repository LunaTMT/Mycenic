<?php

namespace App\Http\Controllers;

use App\Models\ReturnModel;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReturnController extends Controller
{
    // List all returns (admin or user-specific)
    public function index(Request $request)
    {
        $user = $request->user();

        $returns = $user->role === 'admin'
        ? ReturnModel::latest()->get()
        : ReturnModel::where('user_id', $user->id)->latest()->get();

        return inertia('Returns/CustomerReturns', [
            'returns' => $returns,
        ]);
    }

    // Show a single return
    public function show($id)
    {
        $return = ReturnModel::with('order')->findOrFail($id);

        return inertia('Returns/ReturnDetail', [
            'return' => $return,
        ]);
    }

    // Create or update a return for a given order
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'selectedItems' => 'required|array',
            'shippingOption' => 'nullable|string',
            'shippingLabelUrl' => 'nullable|url',
            'finishedAt' => 'nullable|date',
        ]);

        $order = Order::findOrFail($request->input('order_id'));

        // You can check authorization here if needed
        if ($request->user()->id !== $order->user_id && $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $return = ReturnModel::updateOrCreate(
            ['order_id' => $order->id],
            [
                'completed_at' => $request->input('finishedAt', Carbon::now()),
                'shipping_option' => $request->input('shippingOption'),
                'shipping_label_url' => $request->input('shippingLabelUrl'),
                'items' => $request->input('selectedItems'),
                'status' => 'PRE-RETURN',
                'approved' => false,
            ]
        );

        return response()->json([
            'message' => 'Return submitted successfully.',
            'return' => $return,
        ]);
    }

    // Update status or approval (admin)
    public function update(Request $request, $id)
    {
        $return = ReturnModel::findOrFail($id);

        $this->authorize('update', $return);

        $return->update($request->only(['status', 'approved']));

        return response()->json([
            'message' => 'Return updated successfully.',
            'return' => $return,
        ]);
    }
}
