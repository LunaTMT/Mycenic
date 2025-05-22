<?php

namespace App\Http\Controllers;

use App\Services\ShippoService;
use App\Models\Order;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;


class ShippingController extends Controller
{
    protected $shippoService;

    public function __construct(ShippoService $shippoService)
    {
        $this->shippoService = $shippoService;
    }

    /**
     * Get shipping rates for an order
     */
    public function getRates($orderId)
    {
        $order = Order::findOrFail($orderId);
        $rates = $this->shippoService->getRates($order);

        if ($rates) {
            return response()->json([
                'status' => 'success',
                'data' => $rates
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Shipping rates not available.'
        ], 404);
    }


    public function getReturnOptions(Request $request)
    {
        $from = $request->input('from', []);
        
        // Ensure 'country' is set to 'GB' by default if not provided
        if (!isset($from['country']) || empty($from['country'])) {
            $from['country'] = 'GB';
        }
        
        $weight = $request->input('weight');

        // Log the weight value
        Log::info('Shipping weight received:', ['weight' => $weight]);

        $to = [ 
            'street1' => '123 Warehouse Ave',
            'city' => 'London',
            'zip' => 'E1 6AN',
            'country' => 'GB',
        ];

        $parcel = [
            'length' => 10,
            'width' => 10,
            'height' => 10,
            'distance_unit' => 'cm',
            'weight' => $weight,
            'mass_unit' => 'kg',
        ];

        $rates = $this->shippoService->getShippingRates($from, $to, $parcel);

        return response()->json([
            'options' => collect($rates)->map(fn($r) => [
                'id' => $r['object_id'],
                'label' => "{$r['provider']} - {$r['servicelevel']['name']}",
                'price' => $r['amount'],
            ]),
        ]);
    }



    /**
     * Purchase shipping label
     */
    public function purchaseLabel(Request $request)
    {
        $label = $this->shippoService->purchaseLabel($request->rate_id);

        if ($label) {
            return response()->json([
                'status' => 'success',
                'data' => $label
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Unable to purchase shipping label.'
        ], 400);
    }

    /**
     * Track a shipment
     */
    public function trackShipment($carrier, $trackingNumber)
    {
        $tracking = $this->shippoService->trackShipment($carrier, $trackingNumber);

        if ($tracking) {
            return response()->json([
                'status' => 'success',
                'data' => $tracking
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Tracking information not found.'
        ], 404);
    }
    public function validateAddress(Request $request)
    {
        $client = new Client();

        $apiKey = env('GOOGLE_API_KEY'); 
        $url = "https://addressvalidation.googleapis.com/v1:validateAddress?key={$apiKey}";

        $addressData = $request->only(['address', 'city', 'zip']);

        $payload = [
            'address' => [
                'addressLines' => [$addressData['address']],
                'locality' => $addressData['city'],
                'postalCode' => $addressData['zip'],
                'regionCode' => 'GB',
            ]
        ];

        try {
            $response = $client->post($url, ['json' => $payload]);
            $data = json_decode($response->getBody()->getContents(), true);

            // ✅ Log full response for debugging
            Log::info('Google Address Validation Response', ['response' => $data]);

            $verdict = $data['result']['verdict'] ?? [];

            $addressComplete = $verdict['addressComplete'] ?? false;
            $hasUnconfirmedComponents = $verdict['hasUnconfirmedComponents'] ?? false;

            if ($addressComplete && !$hasUnconfirmedComponents) {
                return response()->json([
                    'valid' => true,
                    'data' => $data['result'],
                ]);
            } else {
                return response()->json([
                    'valid' => false,
                    'messages' => ['Address is incomplete or contains unconfirmed components.'],
                    'data' => $data['result'] ?? [],
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Google Address Validation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'valid' => false,
                'messages' => ['An error occurred during validation.'],
            ], 500);
        }
    }
};