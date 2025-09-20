<?php

namespace App\Http\Controllers\User;

use App\Models\ReturnModel;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $returns = $user->role === 'admin'
            ? ReturnModel::latest()->get()
            : ReturnModel::where('user_id', $user->id)->latest()->get();

        // Log the fetched returns
        Log::info('Fetched returns', [
            'user_id' => $user->id,
            'is_admin' => $user->role === 'admin',
            'returns' => $returns->toArray(),
        ]);

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

    public function store(Request $request)
    {
        \Log::info('Return store request received', [
            'user_id' => $request->user()->id,
            'order_id' => $request->input('order_id'),
            'selected_items' => $request->input('selectedItems'),
            'shipping_option' => $request->input('shippingOption'),
            'shipping_label_url' => $request->input('shippingLabelUrl'),
            'finished_at' => $request->input('finishedAt'),
        ]);

        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'selectedItems' => 'required|array',
            'shippingOption' => 'nullable|string',
            'shippingLabelUrl' => 'nullable|url',
            'finishedAt' => 'nullable|date',
        ]);

        $order = Order::findOrFail($request->input('order_id'));

        if ($request->user()->id !== $order->user_id && $request->user()->role !== 'admin') {
            \Log::warning('Unauthorized return store attempt', [
                'user_id' => $request->user()->id,
                'order_user_id' => $order->user_id,
                'role' => $request->user()->role,
                'order_id' => $order->id,
            ]);
            abort(403, 'Unauthorized');
        }

        $return = ReturnModel::updateOrCreate(
            ['order_id' => $order->id],
            [
                'completed_at' => $request->input('finishedAt', \Carbon\Carbon::now()),
                'shipping_option' => $request->input('shippingOption'),
                'shipping_label_url' => $request->input('shippingLabelUrl'),
                'items' => $request->input('selectedItems'),
                'status' => 'PRE-RETURN',
                'approved' => false,
            ]
        );

        \Log::info('Return created or updated', [
            'return_id' => $return->id,
            'order_id' => $return->order_id,
            'items' => $return->items,
            'status' => $return->status,
            'approved' => $return->approved,
        ]);

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

    public function details($id)
    {
        $user = Auth::user();

        $return = ReturnModel::where('id', $id)
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$return) {
            return response()->json(['message' => 'Return not found'], 404);
        }

        // Decode items JSON into a collection (or array)
        $items = collect($return->items ?? []);
        Log::info('Return items:', [
            'return_id' => $return->id,
            'items' => $items->toArray(),
        ]);

        return response()->json([
            'id' => $return->id,
            'order_id' => $return->order_id,
            'status' => $return->status,
            'approved' => $return->approved,
            'completed_at' => $return->completed_at,
            'shipping_label_url' => $return->shipping_label_url,
            'payment_status' => $return->payment_status,
            'shipping_status' => $return->shipping_status,
            'items' => $items->map(function ($item) {
                return [
                    'id' => $item['id'] ?? null,
                    'name' => $item['name'] ?? '',
                    'image' => $item['image_url'] ?? '',
                    'quantity' => $item['quantity'] ?? 0,
                    'price' => $item['price'] ?? 0,
                ];
            }),
        ]);
    }

}
