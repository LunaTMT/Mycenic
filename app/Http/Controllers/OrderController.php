<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;  
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Services\ShippoService;
use App\Models\User;
use App\Mail\OrderConfirmation;

use Shippo;
use Shippo_Shipment;

class OrderController extends Controller
{

   
    protected $shippoService;

    public function __construct(ShippoService $shippoService)
    {
        $this->shippoService = $shippoService;
        Log::info('OrderController initialized.');
    }



    public function index(Request $request)
    {
        $user = $request->user();
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
                    'shippo',                // carrier as a string
                    'SHIPPO_DELIVERED'       // test tracking number as a string
                );

                /*
                CHANGE ON PRODUCTION
                    carrier shippo

                    SHIPPO_DELIVERED
                    SHIPPO_TRANSIT
                    SHIPPO_EXCEPTION
                    SHIPPO_UNKNOWN
                    SHIPPO_PENDING

                    $trackingData = $this->shippoService->trackShipment(
                    $order->carrier,
                    $order->tracking_number
                );
                */

                if (!empty($trackingData['tracking_status'])) {
                    $status = $this->toTitleCase($trackingData['tracking_status']['status']);
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
                    'city', 'zip', 'country', 'phone', 'email', 'is_completed', 'returnable', 
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




    public function create(Request $request)
    {
        try {
            Log::info('Processing order creation');
            Log::info('Session details', [
                'total'           => session('total', 0),
                'subtotal'        => session('subtotal', 0),
                'weight'          => session('weight', 0),
                'discount'        => session('discount', 0),
                'shippingCost'    => session('shippingCost', 0), // <-- added
                'shippingDetails' => session('shippingDetails', []),
                'legalAgreement'  => session('legalAgreement', null),
            ]);

            $shippingDetails = session('shippingDetails', []);
            $legalAgreement = session('legalAgreement', null);
            $shippingCost = session('shippingCost', 0); // <-- retrieve from session

            if (!empty($shippingDetails['email'])) {
                $user = User::where('email', $shippingDetails['email'])->first();
                if (!$user) {
                    Log::error('User not found with shipping email', ['email' => $shippingDetails['email']]);
                    return redirect()->route('home')->with('flash.error', 'User not found with shipping email.');
                }
                Log::info('User found by shipping email', ['user_id' => $user->id]);
            } else {
                Log::error('Missing email in shipping details');
                return redirect()->route('cart')->with('error', 'Missing email in shipping details.');
            }

            Log::info('Shipping details received', $shippingDetails);

            $order = Order::create([
                'user_id'         => $user->id,
                'cart'            => json_encode(session('cart', [])),
                'total'           => session('total', 0),
                'subtotal'        => session('subtotal', 0),
                'weight'          => session('weight', 0),
                'discount'        => session('discount', 0),
                'shipping_cost'   => $shippingCost, // <-- save to DB
                'payment_status'  => 'Completed',
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

            $order->tracking_number = 'SHIPPO_DELIVERED';
            $order->carrier = 'shippo';
            $order->save();

            // Clear session
            session()->forget([
                'cart', 'total', 'subtotal', 'weight', 'discount',
                'shippingDetails', 'legalAgreement', 'shippingCost' // <-- forget shippingCost
            ]);
            Log::info('Session data (cart and order) cleared after order completion');

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

        $cartItems = json_decode($order->cart, true) ?? [];

        $items = collect($cartItems)->map(function ($item) {
            return [
                'id'       => $item['id'] ?? null,
                'name'     => $item['name'] ?? 'Unknown Item',
                'quantity' => $item['quantity'] ?? 1,
                'price'    => $item['price'] ?? 0,
                'image'    => $item['image'] ?? null,
                'weight'   => $item['weight'] ?? 0, // Include weight here
            ];
        })->toArray();


        return Inertia::render('Orders/ReturnInstructions', [
            'orderId'        => $order->id,
            'items'          => $items,
            'returnLabelUrl' => 'https://example.com/return-label.pdf',
            'returnStatus'   => 'in_transit', 

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


}
