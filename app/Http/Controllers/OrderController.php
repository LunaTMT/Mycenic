<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;  
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Arr;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;


use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;



use App\Models\Order;
use App\Models\ReturnModel;
use App\Models\User;
use App\Services\ShippoService;
use App\Mail\OrderConfirmation;

use Shippo;
use Shippo_Shipment;

use Carbon\Carbon;




class OrderController extends Controller
{

    use AuthorizesRequests;
    protected $shippoService;

    public function __construct(ShippoService $shippoService)
    {
        $this->shippoService = $shippoService;
        Log::info('OrderController initialized.');
    }



    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return Inertia::render('Auth/Login/Login', [
                'flash' => [
                    'error' => 'You must be logged in to view this.'
                ]
            ]);

        }

        

        Log::info("Orders index accessed by user ID: {$user->id}, role: {$user->role}");

        // Base query, newest first
        $query = Order::orderBy('created_at', 'desc');

        // If the user is NOT an admin, restrict to their own orders
        if ($user->role !== 'admin') {
            Log::info("Restricting orders to user ID: {$user->id}");
            $query->where('user_id', $user->id);
        }

        $orders = $query->get()->map(function (Order $order) {
            Log::info("Processing order ID: {$order->id}");

            // Update tracking status/history if needed
            if ($order->tracking_number) {
                Log::info("Tracking shipment for order ID: {$order->id} with tracking number: {$order->tracking_number}");

                $trackingData = $this->shippoService->trackShipment(
                    $order->carrier,          // carrier string (adjust for production)
                    $order->tracking_number   // test tracking number string (adjust for production)
                );

                /*
                    CHANGE ON PRODUCTION
                    carrier: $order->carrier
                    tracking number: $order->tracking_number
                */

                if (!empty($trackingData['tracking_status'])) {
                    $status = strtoupper($trackingData['tracking_status']['status']);
                    $order->update(['shipping_status' => $status]);
                    Log::info("Updated shipping status for order {$order->id}", ['status' => $status]);
                }

                if (!empty($trackingData['tracking_history'])) {
                    $history = array_map(fn($h) => [
                        'status_date'    => $h['status_date'],
                        'status_details' => $h['status_details'],
                        'location'       => $h['location'] ?? null,
                        'status'         => $h['status'],
                        'substatus'      => $h['substatus'] ?? null,
                        'object_id'      => $h['object_id'],
                    ], $trackingData['tracking_history']);

                    $order->update(['tracking_history' => $history]);
                    Log::info("Stored tracking history for order {$order->id}");
                }
            }

            return array_merge(
                $order->only([
                    'id', 'user_id', 'total', 'subtotal', 'shipping_cost', 'weight',
                    'discount', 'payment_status', 'shipping_status', 'carrier',
                    'tracking_number', 'tracking_url', 'customer_name', 'address',
                    'city', 'zip', 'country', 'phone', 'email', 'is_completed', 'returnable', 'return_status'
                ]),
                [
                    'created_at'       => $order->created_at->toISOString(),
                    'updated_at'       => $order->updated_at->toISOString(),
                    'cart'             => json_decode($order->cart, true),
                    'tracking_history' => $order->tracking_history ?? [],
                ]
            );
        });

        Log::info("Returning " . $orders->count() . " orders to view");

        return Inertia::render('Orders/CustomerOrders', [
            'orders'    => $orders,
            'message'   => session('message'),
            'clearCart' => session('clearCart'),
        ]);
    }




    public function create(Request $request, ShippoService $shippoService)
    {
        try {
            Log::info('Processing order creation');
            Log::info('Session details', [
                'total'           => session('total', 0),
                'subtotal'        => session('subtotal', 0),
                'weight'          => session('weight', 0),
                'discount'        => session('discount', 0),
                'shippingCost'    => session('shippingCost', 0),
                'shippingDetails' => session('shippingDetails', []),
                'legalAgreement'  => session('legalAgreement', null),
            ]);

            $shippingDetails = session('shippingDetails', []);
            $legalAgreement = session('legalAgreement', null);
            $shippingCost = session('shippingCost', 0);
            

    
            $user = Auth::check()
                ? Auth::user()
                : User::where('email', $shippingDetails['email'] ?? null)->first();

            Log::info('Shipping details received', $shippingDetails);

            $order = Order::create([
                'user_id'         => $user->id,
                'cart'            => json_encode(session('cart', [])),
                'returnable_cart' => json_encode(session('cart', [])),
                'total'           => session('total', 0),
                'subtotal'        => session('subtotal', 0),
                'weight'          => session('weight', 0),
                'discount'        => session('discount', 0),
                'shipping_cost'   => $shippingCost,
                'payment_status'  => 'COMPLETED',
                'customer_name'   => $shippingDetails['name'] ?? 'Unknown',
                'address'         => $shippingDetails['address'] ?? '',
                'city'            => $shippingDetails['city'] ?? '',
                'zip'             => $shippingDetails['zip'] ?? '',
                'country'         => $shippingDetails['country'] ?? 'GB',
                'phone'           => $shippingDetails['phone'] ?? null,
                'email'           => $shippingDetails['email'] ?? null,
                'legal_agreement' => $legalAgreement,
            ]);

            Log::info('Order created successfully', ['order' => $order]);

            // Use Shippo to create shipment and purchase label
            $shipment = $shippoService->createShipment($order);
            if (!empty($shipment['rates'])) {
                $cheapestRate = collect($shipment['rates'])->sortBy('amount')->first();
                $label = $shippoService->purchaseLabel($cheapestRate['object_id']);

                $order->tracking_number = $label['tracking_number'];
                $order->carrier = $label['carrier'];
                $order->shipment_id = $label['shipment_id'];
                $order->label_url = $label['label_url'];

                $order->tracking_number = 'SHIPPO_DELIVERED';
                $order->carrier = 'shippo';
                $order->save();

                $order->save();

                Log::info('Label purchased and tracking added', ['tracking' => $label]);
            } else {
                Log::error('No shipping rates available from Shippo');
            }

            // Clear session
            session()->forget([
                'cart', 'total', 'subtotal', 'weight', 'discount',
                'shippingDetails', 'legalAgreement', 'shippingCost'
            ]);
            Log::info('Session data cleared after order completion');

            return Auth::check()
                ? redirect()->route('orders.index')->with('flash.success', 'Order successfully placed.')
                : redirect()->route('home')->with('flash.success', 'Order successfully placed.');

        } catch (\Exception $e) {
            Log::error('Error placing order', [
                'error' => $e->getMessage(),
                'stack' => $e->getTraceAsString()
            ]);
            return Inertia::render('Shop');
        }
    }



    public function toTitleCase(string $string): string
    {
        // Convert the string to title case
        return ucwords(strtolower($string));
    }



    public function toggleCompleted(Order $order)
    {
        $order->is_completed = !$order->is_completed;
        $order->save();

        Log::info('Order completion toggled', [
            'order_id' => $order->id,
            'new_status' => $order->is_completed,
            'user_id' => auth()->id() ?? 'guest',
        ]);

        return back();
    }

    public function returnInstructions(Order $order)
    {
        $this->authorize('view', $order);

        // Use returnable_cart instead of cart
        $returnableCartItems = json_decode($order->returnable_cart, true) ?? [];

        $items = collect($returnableCartItems)->map(function ($item) {
            return [
                'id'       => $item['id'] ?? null,
                'name'     => $item['name'] ?? 'Unknown Item',
                'quantity' => $item['quantity'] ?? 1,
                'price'    => $item['price'] ?? 0,
                'image'    => $item['image'] ?? null,
                'weight'   => $item['weight'] ?? 0,
            ];
        })->toArray();

        return Inertia::render('Orders/Return/ReturnInstructions', [
            'orderId' => $order->id,
            'items'   => $items,
        ]);
    }



    public function fetchReturnOptions(Request $request, $orderId)
    {
        \Log::info("getReturnOptions called", ['orderId' => $orderId]);

        $order = Order::find($orderId);
        if (!$order) {
            \Log::warning("Order not found", ['orderId' => $orderId]);
            return response()->json(['error' => 'Order not found'], 404);
        }
        \Log::info("Order found", ['orderId' => $orderId, 'order' => $order->toArray()]);

        if (!$order->country || !$order->zip || !$order->city || !$order->address) {
            \Log::warning("Incomplete shipping address on order", ['orderId' => $orderId, 'address' => $order->only(['country','zip','city','address'])]);
            return response()->json(['error' => 'Incomplete shipping address on order'], 400);
        }

        $weight = $order->weight ?? 2;
        \Log::info("Using weight for shipment", ['weight' => $weight]);

        $parcel = [
            'length' => '10',
            'width' => '10',
            'height' => '5',
            'distance_unit' => 'in',
            'weight' => (string)$weight,
            'mass_unit' => 'lb'
        ];
        \Log::info("Parcel details prepared", ['parcel' => $parcel]);

        $toAddress = [
            'name'    => 'Mycenic',
            'street1' => '126 Henry Shuttlewood Drive',
            'city'    => 'Chelmsford',
            'country' => 'GB',
            'zip'     => 'CM1 6EQ',
            'phone'   => '+44 15555555555',
            'email'   => 'support@mycenic.com'
        ];
        

        $fromAddress = [
            'name'    => $order->customer_name,
            'street1' => $order->address,
            'city'    => $order->city,
            'country' => $order->country,
            'zip'     => $order->zip,
            'phone'   => $order->phone ?? '',
            'email'   => $order->email ?? '',
        ];
       

       
                       
        $shipment = Shippo_Shipment::create([
            'address_from' => $fromAddress,
            'address_to' => $toAddress,
            'parcels' => [$parcel],
            'async' => false
        ]);

         // Parse rates
        $parsedRates = [];
      
                if (!empty($shipment['rates'])) {
                    foreach ($shipment['rates'] as $rate) {
                        $parsedRate = [
                            'amount' => $rate['amount'],
                            'currency' => $rate['currency'],
                            'provider' => $rate['provider'],
                            'service' => $rate['servicelevel']['name'] ?? 'Unknown',
                            'object_id' => $rate['object_id']
                        ];
                        $parsedRates[] = $parsedRate;
                        Log::info('Rate found', $parsedRate);
                    }
                } else {
                    Log::warning('No rates returned from Shippo');
                }
        

        Log::info('Parsed shipping rates successfully');

        return response()->json($parsedRates);

    

    }


    public function getPaymentIntent(Request $request)
    {
        // Log the full incoming request
        Log::info('Incoming getPaymentIntent request', [
            'request_data' => $request->all(),
        ]);

        // Get 'total' and 'order_id' from the request input
        $amount = $request->input('total');        // total amount to charge
        $orderId = $request->input('order_id');    // order ID for metadata

        // Log the parsed values
        Log::info('Parsed input', [
            'total' => $amount,
            'order_id' => $orderId,
        ]);

        // Validate amount is numeric and positive
        if (!is_numeric($amount) || $amount <= 0) {
            Log::warning('Invalid amount provided', ['amount' => $amount]);
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $amountInCents = (int) ($amount * 100);

        // Set Stripe API key
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        // Create PaymentIntent
        try {
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'gbp',
                'metadata' => [
                    'order_id' => $orderId ?? 'unknown',
                ],
            ]);

            Log::info('PaymentIntent created', [
                'id' => $paymentIntent->id,
                'amount' => $amountInCents,
            ]);
        } catch (\Exception $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to create payment intent'], 500);
        }

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
            'amount' => $amount,
        ]);
    }




    public function finishReturn(Request $request, $orderId)
    {
        Log::info('finishReturn reached', ['orderId' => $orderId]);

        // Log raw input for debugging
        Log::info('Raw request input', $request->all());

        try {
            Log::info('Starting request validation...');
            $request->validate([
                'paymentIntentClientSecret' => 'required|string',
                'selectedShippingOption' => 'nullable|array',
                'selectedShippingOption.amount' => 'required_with:selectedShippingOption|numeric',
                'selectedShippingOption.currency' => 'required_with:selectedShippingOption|string',
                'selectedShippingOption.provider' => 'required_with:selectedShippingOption|string',
                'selectedShippingOption.service' => 'required_with:selectedShippingOption|string',
                'selectedShippingOption.object_id' => 'required_with:selectedShippingOption|string',
                'shippingLabelUrl' => 'nullable|url',
                'selectedItems' => 'required|array',
                'selectedItems.*' => 'array',
                'selectedItems.*.0' => 'required|integer|min:1',
                'selectedItems.*.1' => 'required|integer|min:1',
                'finishedAt' => 'nullable|date',
            ]);
            Log::info('Validation passed');
        } catch (\Illuminate\Validation\ValidationException $ve) {
            Log::error('Validation failed in finishReturn', [
                'orderId' => $orderId,
                'errors' => $ve->errors(),
            ]);
            return response()->json(['errors' => $ve->errors()], 422);
        }

        // Verify Stripe payment
        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $clientSecret = $request->paymentIntentClientSecret;
            $paymentIntentId = explode('_secret', $clientSecret)[0];
            Log::info('Retrieving PaymentIntent', ['payment_intent_id' => $paymentIntentId]);

            $intent = PaymentIntent::retrieve($paymentIntentId);

            Log::info('PaymentIntent retrieved', ['status' => $intent->status]);

            if ($intent->status !== 'succeeded') {
                Log::warning('Payment not completed', ['payment_intent_id' => $paymentIntentId]);
                return response()->json(['error' => 'Payment not completed.'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Payment verification failed', [
                'orderId' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Payment verification failed.', 'message' => $e->getMessage()], 500);
        }

        Log::info('Fetching order from DB', ['orderId' => $orderId]);
        $order = Order::findOrFail($orderId);
        Log::info('Order retrieved', ['order_status' => $order->status]);

        $selectedItemsRaw = $request->input('selectedItems');
        Log::info('Raw selected items for return', [
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'selected_items_raw' => $selectedItemsRaw,
        ]);

        $returnableCart = json_decode($order->returnable_cart ?? '[]', true);
        Log::info('Current returnable cart', ['returnable_cart' => $returnableCart]);

        // Build full item info from selectedItems
        $selectedItemsFull = collect($selectedItemsRaw)->map(function ($pair) use ($returnableCart) {
            [$id, $quantity] = $pair;

            $matched = collect($returnableCart)->firstWhere('id', $id);

            if (!$matched) {
                Log::warning('Selected item ID not found in returnable_cart', ['missing_id' => $id]);
                return null;
            }

            return array_merge($matched, ['return_quantity' => $quantity]);
        })->filter()->values()->all();

        Log::info('Selected items full (with return quantity)', ['items' => $selectedItemsFull]);

        // Remove selected items from returnable_cart
        $selectedItemIds = array_column($selectedItemsRaw, 0);
        Log::info('Parsed selected item IDs', ['selected_item_ids' => $selectedItemIds]);

        $updatedCart = collect($returnableCart)->reject(function ($item) use ($selectedItemIds) {
            return in_array($item['id'], $selectedItemIds);
        })->values()->all();

        Log::info('Updated returnable cart after filtering selected items', ['updated_cart' => $updatedCart]);

        $order->returnable_cart = json_encode($updatedCart);

        // If returnable_cart is empty, mark the order as non-returnable
        if (empty($updatedCart)) {
            $order->returnable = false;
            Log::info('Returnable cart is now empty. Setting order.returnable = false', ['order_id' => $order->id]);
        }

        $shippingOption = $request->input('selectedShippingOption');
        Log::info('Shipping option received', ['shipping_option' => $shippingOption]);
        $shippingOptionJson = $shippingOption ? json_encode($shippingOption) : null;
        Log::info('Shipping option JSON', ['shipping_option_json' => $shippingOptionJson]);

        try {
            $return = ReturnModel::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'completed_at' => $request->input('finishedAt', now()),
                'shipping_option' => $shippingOptionJson,
                'shipping_label_url' => $request->input('shippingLabelUrl'),
                'items' => $selectedItemsFull,
                'status' => 'PRE-RETURN',
                'approved' => false,
            ]);

            Log::info('Return created successfully', [
                'return_id' => $return->id,
                'order_id' => $order->id,
                'items' => $return->items,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create ReturnModel', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Could not create return record.'], 500);
        }

        try {
            $order->return_status = 'PRE-RETURN';
            $order->save();

            Log::info('Order updated and saved', ['order_id' => $order->id]);
        } catch (\Exception $e) {
            Log::error('Failed to update and save order return_status', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Could not update order return status.'], 500);
        }

        Log::info('Redirecting to returns.index');
        return Redirect::route('returns.index')
            ->with('flash.success', 'Return finalized successfully.');
    }







    public function isReturnable(Order $order)
    {
        // Assuming your Order model has the isReturnable() method defined
        return response()->json([
            'is_returnable' => $order->isReturnable(),
        ]);
    }


}