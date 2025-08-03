<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

use Stripe\Stripe;
use Stripe\PaymentIntent;

use App\Models\Order;
use App\Models\ReturnModel;
use App\Models\User;
use App\Services\ShippoService;

use Shippo_Shipment;

class OrderController extends Controller
{
    use AuthorizesRequests;

    protected ShippoService $shippoService;

    public function __construct(ShippoService $shippoService)
    {
        $this->shippoService = $shippoService;
        Log::info('OrderController initialized.');
    }

    /**
     * Display a list of orders accessible to the user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Unauthorized access attempt to orders index.');

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            return Inertia::render('Auth/Login/Login', [
                'flash' => ['error' => 'You must be logged in to view this.'],
            ]);
        }

        Log::info('Orders index accessed by user', ['user_id' => $user->id, 'role' => $user->role]);

        $query = Order::orderBy('created_at', 'desc');

        if ($user->role === 'admin') {
            $requestedUserId = $request->input('user_id');

            if ($requestedUserId) {
                Log::info('Admin filtering orders by user_id', ['admin_id' => $user->id, 'target_user_id' => $requestedUserId]);
                $query->where('user_id', $requestedUserId);
            } else {
                Log::info('Admin viewing all orders', ['admin_id' => $user->id]);
            }
        } else {
            Log::info('Regular user viewing their own orders', ['user_id' => $user->id]);
            $query->where('user_id', $user->id);
        }

        $orders = $query->get();

        Log::info('Orders retrieved', ['order_count' => $orders->count()]);

        return response()->json(['orders' => $orders]);
    }

    /**
     * Create a new order from session/cart data.
     */
    public function create(Request $request)
    {
        try {
            Log::info('Processing order creation started', [
                'total'           => session('total', 0),
                'subtotal'        => session('subtotal', 0),
                'weight'          => session('weight', 0),
                'discount'        => session('discount', 0),
                'shippingCost'    => session('shippingCost', 0),
                'shippingDetails' => session('shippingDetails', []),
                'legalAgreement'  => session('legalAgreement', null),
                'selectedRate'    => session('selectedShippingRate'),
            ]);

            $shippingDetails = session('shippingDetails', []);

            $user = Auth::check()
                ? Auth::user()
                : User::where('email', $shippingDetails['email'] ?? null)->first();

            Log::info('User identified for order', [
                'user_id'    => $user?->id ?? 'guest',
                'user_email' => $user?->email ?? 'N/A',
            ]);

            $order = Order::create([
                'user_id'      => $user?->id,
                'cart'             => session('cart', []),
                'total'            => session('total', 0),
                'subtotal'         => session('subtotal', 0),
                'weight'           => session('weight', 0),
                'discount'         => session('discount', 0),
                'shipping_cost'    => session('shippingCost', 0),
                'payment_status'   => 'COMPLETED',
                'shipping_details' => $shippingDetails,
                'legal_agreement'  => session('legalAgreement', null),
            ]);

            Log::info('Order created successfully', ['order_id' => $order->id]);

            // Create shipment using Shippo
            $shipment = $this->shippoService->createOrderShipment($order);

            if (!empty($shipment['rates'])) {
                Log::info('Shipping rates retrieved from Shippo', ['rates_count' => count($shipment['rates'])]);

                $selectedRateId = session('selectedShippingRate') ?? $request->input('selectedShippingRate');

                if (!$selectedRateId) {
                    throw new \Exception('No shipping rate selected');
                }

                $selectedRate = collect($shipment['rates'])->firstWhere('object_id', $selectedRateId);

                if (!$selectedRate) {
                    throw new \Exception('Selected shipping rate not valid');
                }

                Log::info('User selected shipping rate found', ['rate' => $selectedRate]);

                try {
                    $label = $this->shippoService->purchaseLabel($selectedRate['object_id']);

                    Log::info('Shipping label purchased', ['label' => $label]);

                    $order->update([
                        'tracking_number' => $label['tracking_number'] ?? 'SHIPPO_DELIVERED',
                        'carrier'         => $label['carrier'] ?? 'shippo',
                        'shipment_id'     => $label['shipment_id'] ?? null,
                        'label_url'       => $label['label_url'] ?? null,
                    ]);

                    Log::info('Order updated with shipping label info', ['order_id' => $order->id]);
                } catch (\Exception $e) {
                    Log::error('Failed to purchase shipping label', [
                        'order_id' => $order->id,
                        'error'    => $e->getMessage(),
                    ]);
                }
            } else {
                Log::error('No shipping rates returned from Shippo');
            }

            // Clear session data related to the order
            session()->forget([
                'cart',
                'total',
                'subtotal',
                'weight',
                'discount',
                'shippingDetails',
                'legalAgreement',
                'shippingCost',
                'selectedShippingRate',
            ]);

            Log::info('Order session data cleared');

            return Auth::check()
                ? redirect()->route('orders.index')->with('flash.success', 'Order successfully placed.')
                : redirect()->route('home')->with('flash.success', 'Order successfully placed.');

        } catch (\Exception $e) {
            Log::error('Exception occurred during order creation', [
                'message' => $e->getMessage(),
                'stack'   => $e->getTraceAsString(),
            ]);

            return Inertia::render('Shop')->with('flash.error', 'Something went wrong placing your order.');
        }
    }


    /**
     * Toggle the 'completed' status of an order.
     */
    public function toggleCompleted(Order $order)
    {
        $order->is_completed = !$order->is_completed;
        $order->save();

        Log::info('Order completion toggled', [
            'order_id'    => $order->id,
            'new_status'  => $order->is_completed,
            'user_id' => auth()->id() ?? 'guest',
        ]);

        return back();
    }

    /**
     * Show return instructions page with returnable items.
     */
    public function returnInstructions(Order $order)
    {
        $this->authorize('view', $order);

        $items = collect($order->returnable_cart)->map(fn($item) => [
            'id'       => $item['id'] ?? null,
            'name'     => $item['name'] ?? 'Unknown Item',
            'quantity' => $item['quantity'] ?? 1,
            'price'    => $item['price'] ?? 0,
            'image'    => $item['image'] ?? null,
            'weight'   => $item['weight'] ?? 0,
        ])->toArray();

        return Inertia::render('Profile/Tabs/Orders/Return/ReturnInstructions', [
            'orderId' => $order->id,
            'items'   => $items,
        ]);
    }

    /**
     * Fetch shipping return options based on order details.
     */
    public function fetchReturnOptions(Request $request, $orderId)
    {
        Log::info("📦 fetchReturnOptions called", ['orderId' => $orderId]);

        $order = Order::find($orderId);
        if (!$order) {
            Log::warning("❌ Order not found", ['orderId' => $orderId]);
            return response()->json(['error' => 'Order not found'], 404);
        }

        $shippingDetails = $order->shipping_details ?? [];

        if (
            empty($shippingDetails['address']) ||
            empty($shippingDetails['city']) ||
            empty($shippingDetails['zip'])
        ) {
            Log::warning("❌ Incomplete shipping address on order", [
                'orderId' => $orderId,
                'shipping_details' => $shippingDetails,
            ]);
            return response()->json(['error' => 'Incomplete shipping address on order'], 400);
        }

        // Extract shipping details locally
        $address = $shippingDetails['address'];
        $city    = $shippingDetails['city'];
        $zip     = $shippingDetails['zip'];
        $phone   = $shippingDetails['phone'] ?? null;
        $email   = $shippingDetails['email'] ?? null;
        $name    = $shippingDetails['name'] ?? null;
        $country = $shippingDetails['country'] ?? 'GB'; // fallback to GB if missing

        // Prepare a lightweight object or array for shipment creation
        $shippingData = (object)[
            'address' => $address,
            'city'    => $city,
            'zip'     => $zip,
            'phone'   => $phone,
            'email'   => $email,
            'customer_name' => $name,
            'country' => $country,
            'weight'  => $order->weight ?? 2,
        ];

        // Call your Shippo service method with the shipping data object
        $shipment = $this->shippoService->createOrderShipment($shippingData);

        if (!$shipment || empty($shipment['rates'])) {
            Log::error('No shipping rates returned from Shippo or shipment creation failed', ['order_id' => $orderId]);
            return response()->json(['error' => 'No shipping rates available'], 500);
        }

        $parsedRates = collect($shipment['rates'])->map(function ($rate) {
            return [
                'amount'    => $rate['amount'],
                'currency'  => $rate['currency'],
                'provider'  => $rate['provider'],
                'service'   => $rate['servicelevel']['name'] ?? 'Unknown',
                'object_id' => $rate['object_id'],
            ];
        });

        Log::info('✅ Shipping rates fetched successfully', ['count' => count($parsedRates)]);

        return response()->json($parsedRates);
    }



    /**
     * Create Stripe PaymentIntent and return client secret.
     */
    public function getPaymentIntent(Request $request)
    {
        Log::info('Incoming getPaymentIntent request', ['request_data' => $request->all()]);

        $amount = $request->input('total');
        $orderId = $request->input('order_id');

        if (!is_numeric($amount) || $amount <= 0) {
            Log::warning('Invalid amount provided', ['amount' => $amount]);
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $amountInCents = (int) ($amount * 100);
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $paymentIntent = PaymentIntent::create([
                'amount'   => $amountInCents,
                'currency' => 'gbp',
                'metadata' => ['order_id' => $orderId ?? 'unknown'],
            ]);
            Log::info('PaymentIntent created', ['id' => $paymentIntent->id, 'amount' => $amountInCents]);
        } catch (\Exception $e) {
            Log::error('Stripe PaymentIntent creation failed', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create payment intent'], 500);
        }

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
            'amount'       => $amount,
        ]);
    }

    /**
     * Finalize a return process for an order.
     */
    public function finishReturn(Request $request, $orderId)
    {
        Log::info('finishReturn reached', ['orderId' => $orderId, 'request' => $request->all()]);

        try {
            $request->validate([
                'paymentIntentClientSecret' => 'required|string',
                'selectedShippingOption'    => 'nullable|array',
                'shippingLabelUrl'          => 'nullable|url',
                'selectedItems'             => 'required|array',
                'finishedAt'                => 'nullable|date',
                'notes'                    => 'nullable|string',
            ]);
            Log::info('Validation passed');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            Log::error('Validation failed', ['errors' => $ve->errors()]);
            return response()->json(['errors' => $ve->errors()], 422);
        }

        // Verify Stripe payment
        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntentId = explode('_secret', $request->paymentIntentClientSecret)[0];
            $intent = PaymentIntent::retrieve($paymentIntentId);

            if ($intent->status !== 'succeeded') {
                Log::warning('Payment not completed', ['payment_intent_id' => $paymentIntentId]);
                return response()->json(['error' => 'Payment not completed.'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment verification failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Payment verification failed.', 'message' => $e->getMessage()], 500);
        }

        // Load order and prepare return items
        $order = Order::findOrFail($orderId);
        $returnableCart = $order->returnable_cart;
        $selectedItemsRaw = $request->input('selectedItems');

        Log::info('Current returnable cart', ['returnable_cart' => $returnableCart]);
        Log::info('Raw selected items for return', ['selected_items_raw' => $selectedItemsRaw]);

        // Build full selected items with quantities
        $selectedItemsFull = collect($selectedItemsRaw)->map(function ($pair) use ($returnableCart) {
            [$id, $qty] = $pair;
            $item = collect($returnableCart)->firstWhere('id', $id);
            return $item ? array_merge($item, ['quantity' => $qty]) : null;
        })->filter()->values()->all();

        Log::info('Selected items full (with return quantity)', ['items' => $selectedItemsFull]);

        // Adjust returnable cart quantities after return
        $qtyMap = collect($selectedItemsRaw)->mapWithKeys(fn($pair) => [$pair[0] => max(0, intval($pair[1]))]);

        $updatedCart = collect($returnableCart)->map(function ($item) use ($qtyMap) {
            $itemId = $item['id'];
            if ($qtyMap->has($itemId)) {
                $returnQty = $qtyMap[$itemId];
                $currentQty = intval($item['quantity']);

                if ($returnQty >= $currentQty) {
                    return null; // Fully returned, remove item
                } elseif ($returnQty > 0) {
                    $item['quantity'] = $currentQty - $returnQty;
                    $item['total'] = $item['quantity'] * $item['price'];
                    return $item;
                }
            }
            return $item;
        })->filter()->values()->all();

        Log::info('Updated returnable cart after quantity subtraction', ['updated_cart' => $updatedCart]);

        // Update order returnable cart and status
        $order->returnable_cart = $updatedCart;

        if (empty($updatedCart)) {
            $order->returnable = false;
            Log::info('Returnable cart empty, disabling returns', ['order_id' => $order->id]);
        }

        $order->save();

        // Prepare customer details for return record
        $customer = $order->customer ?? $request->user();

        // Calculate totals for return
        $subtotal     = collect($selectedItemsFull)->sum(fn($item) => $item['price'] * $item['quantity']);
        $shippingOpt  = $request->input('selectedShippingOption');
        $shippingCost = isset($shippingOpt['amount']) ? floatval($shippingOpt['amount']) : 0.0;
        $total        = $subtotal + $shippingCost;
        $weight       = collect($selectedItemsFull)->sum(fn($item) => ($item['weight'] ?? 0) * $item['quantity']);

        // Create Return record
        $return = ReturnModel::create([
            'order_id'         => $order->id,
            'user_id'      => $request->user()->id,

            'initiated_at'     => now(),
            'completed_at'     => $request->input('finishedAt', now()),

            'customer_name'    => $customer->name ?? null,
            'address'          => $order->shipping_address ?? null,
            'city'             => $order->shipping_city ?? null,
            'zip'              => $order->shipping_zip ?? null,
            'country'          => $order->shipping_country ?? null,
            'phone'            => $order->shipping_phone ?? null,
            'email'            => $customer->email ?? null,

            'shipping_option'  => $shippingOpt,
            'shipping_status'  => 'PRE-TRANSIT',
            'carrier'          => null,
            'tracking_number'  => null,
            'tracking_url'     => null,
            'tracking_history' => null,
            'shipment_id'      => null,

            'label_url'        => $request->input('shippingLabelUrl'),

            'items'            => $selectedItemsFull,

            'subtotal'         => $subtotal,
            'shipping_cost'    => $shippingCost,
            'total'            => $total,
            'weight'           => $weight,

            'status'           => 'PRE-RETURN',
            'approved'         => false,
            'payment_status'   => 'PRE-RETURN',

            'notes'            => $request->input('notes'),
        ]);

        Log::info('Return created successfully', ['return_id' => $return->id]);

        // Update order return_status
        $order->return_status = 'PRE-RETURN';
        $order->save();

        Log::info('Order updated with return_status', ['order_id' => $order->id]);

        return Redirect::route('returns.index')->with('flash.success', 'Return finalized successfully.');
    }

    /**
     * Check if an order is returnable.
     */
    public function isReturnable(Order $order)
    {
        return response()->json([
            'is_returnable' => $order->isReturnable(),
        ]);
    }

    /**
     * Convert a string to Title Case.
     */
    public function toTitleCase(string $string): string
    {
        return ucwords(strtolower($string));
    }
}
