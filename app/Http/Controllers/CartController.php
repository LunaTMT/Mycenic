<?php

    namespace App\Http\Controllers;
    use App\Models\User; 
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Auth;
    use Inertia\Inertia;
    use Illuminate\Support\Facades\Log;

    use Shippo;
    use Shippo_Shipment;


    class CartController extends Controller
    {
        public function index()
        {
            // 1) Fetch the authenticated user
            $user = Auth::user();
    
        
            return Inertia::render('Shop/Cart/Cart', [
                'auth'            => $user
            ]);
        }
        

        public function getShippingDetails(Request $request)
        {
            $shippingDetails = session('shipping_details', [
                'name' => '',
                'email' => '',
                'phone' => '',
                'address' => '',
                'city' => '',
                'zip' => ''
            ]);
        
            return Inertia::render('Shop/Cart/Shipping/GetShippingDetails', [
                'shippingDetails' => $shippingDetails
            ]);
        }    

        public function storeShippingDetails(Request $request)
        {
            Log::info('storeShipping called', ['request' => $request->all()]);

            $data = $request->validate([
                'name'    => 'required|string|max:255',
                'email'   => 'required|email|max:255',
                'phone'   => 'nullable|string|max:255',
                'address' => 'required|string|max:255',
                'city'    => 'required|string|max:255',
                'zip'     => 'required|string|max:255',
            ]);

            Log::info('Validated shipping data', $data);

            // Check if user exists
            $user = User::where('email', $data['email'])->first(); //should only update exisitinfg user if the signed in user is the same as the one with that email

            if ($user) {
                // Update existing user 
                $user->update([
                    'name'    => $data['name'],
                    'phone'   => $data['phone'] ?? null,
                    'address' => $data['address'],
                    'city'    => $data['city'],
                    'zip'     => $data['zip'],
                ]);
            } else {
                Log::info('Creating user');
                $user = User::create([
                    'name'     => $data['name'],
                    'email'    => $data['email'],
                    'phone'    => $data['phone'] ?? null,
                    'address'  => $data['address'],
                    'city'     => $data['city'],
                    'zip'      => $data['zip'],
                    'password' => null, // <- explicitly null
                ]);
            }

            Log::info('User created or updated', ['user' => $user->toArray()]);
            return redirect()->route('cart')->with('flash.success', 'Shipping details saved successfully!');
        }

        public function getPaymentDetails(Request $request)
        {
            $user = Auth::user();

            // Retrieve cart and shipping details from session or context
            $cart = session('cart', []);
            $shipping = session('shipping_details', []);

            if (empty($cart) || empty($shipping)) {
                return response()->json(['error' => 'Missing cart or shipping details'], 400);
            }

            $amount = $this->calculateCartTotal($cart, $shipping); // Your logic
            $amountInCents = (int)($amount * 100);

            // Set Stripe key and create PaymentIntent
            Stripe::setApiKey(config('services.stripe.secret'));

            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'gbp',
                'metadata' => [
                    'user_id' => $user?->id ?? 'guest',
                    'cart_id' => session()->getId(),
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'amount' => $amount,
                'shippingDetails' => $shipping,
            ]);
        }



        public function getShippingEstimate(Request $request)
        {
            try {

                $request->validate([
                    'weight' => 'required|numeric|min:0.1',
                ]);
                
                // Log incoming request data
                Log::info('Received shipping estimate request', [
                    'weight' => $request->weight,
                ]);
        
                // Set the Shippo API key
                Log::info('Setting Shippo API key');
                Shippo::setApiKey(env('SHIPPO_API_KEY'));
        
                $fromAddress = [
                    'name' => 'Mycenic Ltd',
                    'company' => 'Mycenic Ltd',
                    'street1' => '123 Main Street',
                    'city' => 'London',
                    'state' => '',
                    'zip' => 'E1 6AN',
                    'country' => 'GB',
                    'phone' => '+447911123456',
                    'email' => 'info@mycenic.co.uk'
                ];
                
                $toAddress = [
                    'name' => 'John Doe',
                    'company' => '',
                    'street1' => '221B Baker Street',
                    'city' => 'London',
                    'state' => '',
                    'zip' => 'NW1 6XE',
                    'country' => 'GB',
                    'phone' => '+447911654321',
                    'email' => 'johndoe@example.com'
                ];
                
        
                // Define parcel
                $parcel = [
                    'length' => 10,
                    'width' => 15,
                    'height' => 5,
                    'distance_unit' => 'cm',
                    'weight' => $request->weight,
                    'mass_unit' => 'g'
                ];
                Log::info('Parcel details', $parcel);
        
                // Create shipment
                Log::info('Creating shipment with Shippo...');
                $shipment = Shippo_Shipment::create([
                    'address_from' => $fromAddress,
                    'address_to' => $toAddress,
                    'parcels' => [$parcel],
                    'async' => false
                ]);
                Log::info('Shipment created', ['shipment_object_id' => $shipment['object_id'] ?? 'N/A']);
        
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
        
            } catch (\Exception $e) {
                Log::error('Error fetching shipping estimate', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json(['error' => 'Unable to fetch shipping estimate'], 500);
            }
        }
        
        
    public function getShippingRates(Request $request)
    {
        try {
            $request->validate([
                'weight' => 'required|numeric|min:0.1',
                'address' => 'required|string',
                'city' => 'required|string',
                'zip' => 'required|string',
            ]);

            $userName = auth()->user()?->name ?? 'Customer';

            // Log incoming request data
            Log::info('Received shipping estimate request', [
                'weight' => $request->weight,
                'name' => $userName,
                'address' => $request->address,
                'city' => $request->city,
                'zip' => $request->zip,
            ]);

            Shippo::setApiKey(env('SHIPPO_API_KEY'));

            $fromAddress = [
                'name' => 'Mycenic Ltd',
                'street1' => '123 Main Street',
                'city' => 'London',
                'zip' => 'E1 6AN',
                'country' => 'GB'
            ];

            $toAddress = [
                'name' => $userName,
                'street1' => $request->address,
                'city' => $request->city,
                'zip' => $request->zip,
                'country' => 'GB'
            ];

            $parcel = [
                'length' => 10,
                'width' => 15,
                'height' => 5,
                'distance_unit' => 'cm',
                'weight' => $request->weight,
                'mass_unit' => 'g'
            ];

            $shipment = Shippo_Shipment::create([
                'address_from' => $fromAddress,
                'address_to' => $toAddress,
                'parcels' => [$parcel],
                'async' => false
            ]);

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

            return response()->json($parsedRates);

        } catch (\Exception $e) {
            Log::error('Error fetching shipping estimate', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Unable to fetch shipping estimate'], 500);
        }
    }




    }
