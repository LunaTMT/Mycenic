<?php

namespace App\Http\Controllers\Shipping;

use App\Http\Controllers\Controller; // <-- This line is important!
use Illuminate\Http\Request;
use App\Services\ShippoService;
use Illuminate\Support\Facades\Log;
use App\Models\Cart\Cart;

class ShippingController extends Controller
{
    protected ShippoService $shippo;

    public function __construct(ShippoService $shippo)
    {
        $this->shippo = $shippo;
        Log::info('ShippingController initialized'); // <-- Log inside the constructor
    }

    public function getRates(Request $request)
    {   
        Log::info("getting rates");

        // Validate the incoming request
        $request->validate([
            'address' => 'required|string',
            'city' => 'required|string',
            'zip' => 'required|string',
            'weight' => 'required|numeric|min:0.01', // Ensure weight is valid
        ]);

        Log::info('Shipping rates request validated successfully');

        // Calculate the total weight, here using the weight passed from the frontend
        $totalWeight = $request->weight; 

        // Define the 'from' address (warehouse or business address)
        $from = [
            'name' => 'Mycenic Warehouse',
            'street1' => '126 Henry Shuttlewood Drive',
            'city' => 'Chelmsford',
            'zip' => 'CM1 6EQ',
            'country' => 'GB',
            'phone' => '+44 15555555555',
            'email' => 'support@mycenic.com',
        ];

        // The 'to' address comes from the request
        $to = [
            'address_line1' => $request->address,
            'city' => $request->city,
            'zip' => $request->zip,
            'country' => 'GB', // You can add the country in the frontend if needed
        ];

        // Define parcel dimensions (customize as per your needs)
        $parcel = [
            'length' => '10',
            'width' => '10',
            'height' => '5',
            'distance_unit' => 'in',
            'weight' => (string) $totalWeight,
            'mass_unit' => 'lb',
        ];

        try {
            // Call the Shippo service to get the rates
            $rates = $this->shippo->getShippingRates($from, $to, $parcel);

            // Format the response to only include necessary details
            $formattedRates = collect($rates)->map(fn($r) => [
                'id' => $r['object_id'] ?? '',
                'provider' => $r['provider'] ?? '',
                'servicelevel' => $r['servicelevel']['name'] ?? '',
                'amount' => isset($r['amount']) ? floatval($r['amount']) : 0,
            ])->toArray();

            return response()->json(['rates' => $formattedRates]);
        } catch (\Exception $e) {
            Log::error('Error fetching shipping rates', [
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'rates' => [],
                'message' => 'Failed to fetch shipping rates',
            ], 500);
        }
    }
}
