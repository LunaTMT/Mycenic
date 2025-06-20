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
        Log::info('Raw request input', $request->all());

        // Step 1: Validate
        try {
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
            Log::error('Validation failed', ['errors' => $ve->errors()]);
            return response()->json(['errors' => $ve->errors()], 422);
        }

        // Step 2: Stripe Verification
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

        // Step 3: Load order and cart
        $order = Order::findOrFail($orderId);
        $returnableCart = json_decode($order->returnable_cart ?? '[]', true);
        $selectedItemsRaw = $request->input('selectedItems');
        Log::info('Current returnable cart', ['returnable_cart' => $returnableCart]);
        Log::info('Raw selected items for return', ['selected_items_raw' => $selectedItemsRaw]);

        // Step 4: Build full item info for record
        $selectedItemsFull = collect($selectedItemsRaw)->map(function ($pair) use ($returnableCart) {
            [$id, $qty] = $pair;
            $item = collect($returnableCart)->firstWhere('id', $id);
            return $item ? array_merge($item, ['return_quantity' => $qty]) : null;
        })->filter()->values()->all();

        Log::info('Selected items full (with return quantity)', ['items' => $selectedItemsFull]);

        // Step 5: Subtract return quantities from returnableCart
        $qtyMap = collect($selectedItemsRaw)->mapWithKeys(fn($pair) => [$pair[0] => $pair[1]]);
        $updatedCart = collect($returnableCart)->map(function ($item) use ($qtyMap) {
            if ($qtyMap->has($item['id'])) {
                $returnedQty = $qtyMap[$item['id']];
                $remainingQty = $item['quantity'] - $returnedQty;
                if ($remainingQty > 0) {
                    $item['quantity'] = $remainingQty;
                    $item['total'] = $remainingQty * $item['price'];
                    return $item;
                }
                return null; // Fully returned
            }
            return $item; // Not part of this return
        })->filter()->values()->all();

        Log::info('Updated returnable cart after quantity subtraction', ['updated_cart' => $updatedCart]);

        // Step 6: Update order
        $order->returnable_cart = json_encode($updatedCart);
        if (empty($updatedCart)) {
            $order->returnable = false;
            Log::info('Returnable cart is empty. Setting order.returnable = false', ['order_id' => $order->id]);
        }

        // Step 7: Create return record
        try {
            $return = ReturnModel::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'completed_at' => $request->input('finishedAt', now()),
                'shipping_option' => json_encode($request->input('selectedShippingOption')),
                'shipping_label_url' => $request->input('shippingLabelUrl'),
                'items' => $selectedItemsFull,
                'status' => 'PRE-RETURN',
                'approved' => false,
            ]);
            Log::info('Return created successfully', ['return_id' => $return->id]);
        } catch (\Exception $e) {
            Log::error('Failed to create ReturnModel', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Could not create return record.'], 500);
        }

        // Step 8: Save order changes
        try {
            $order->return_status = 'PRE-RETURN';
            $order->save();
            Log::info('Order updated', ['order_id' => $order->id]);
        } catch (\Exception $e) {
            Log::error('Failed to update order return_status', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Could not update order return status.'], 500);
        }

        // Step 9: Done
        return Redirect::route('returns.index')->with('flash.success', 'Return finalized successfully.');
    }









    public function isReturnable(Order $order)
    {
        // Assuming your Order model has the isReturnable() method defined
        return response()->json([
            'is_returnable' => $order->isReturnable(),
        ]);
    }


}