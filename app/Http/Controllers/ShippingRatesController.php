<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ShippoService;
use Illuminate\Support\Facades\Log;

class ShippingRatesController extends Controller
{
    protected ShippoService $shippo;

    public function __construct(ShippoService $shippo)
    {
        $this->shippo = $shippo;
        Log::info('ShippingRatesController initialized');
    }

    public function getRates(Request $request)
    {
        
        $request->validate([
            'cart' => 'required|array',
            'cart.items' => 'required|array|min:1',
            'cart.items.*.item.id' => 'required|integer',
            'cart.items.*.quantity' => 'required|integer|min:1',
            'cart.items.*.item.weight' => 'required|numeric|min:0.01',
            'destination' => 'required|array',
            'destination.full_name' => 'required|string',
            'destination.address_line1' => 'required|string',
            'destination.city' => 'required|string',
            'destination.zip' => 'required|string',
            'destination.country' => 'required|string',
        ]);

        Log::info('Request validated successfully');

        // Calculate total weight
        $totalWeight = collect($request->cart['items'])
            ->sum(fn($item) => $item['item']['weight'] * $item['quantity']);

        Log::info('Total parcel weight calculated', ['weight' => $totalWeight]);

        $from = [
            'name' => 'Mycenic Warehouse',
            'street1' => '126 Henry Shuttlewood Drive',
            'city' => 'Chelmsford',
            'zip' => 'CM1 6EQ',
            'country' => 'GB',
            'phone' => '+44 15555555555',
            'email' => 'support@mycenic.com',
        ];

        $to = $request->destination;

        $parcel = [
            'length' => '10',
            'width' => '10',
            'height' => '5',
            'distance_unit' => 'in',
            'weight' => (string) $totalWeight,
            'mass_unit' => 'lb',
        ];

        try {
            $rates = $this->shippo->getShippingRates($from, $to, $parcel);

            Log::info('Raw shipping rates fetched', ['rates' => $rates]);

            // Only keep the necessary details
            $formattedRates = collect($rates)->map(fn($r) => [
                'id' => $r['object_id'] ?? '',
                'provider' => $r['provider'] ?? '',
                'servicelevel' => $r['servicelevel']['name'] ?? '',
                'amount' => isset($r['amount']) ? floatval($r['amount']) : 0,
            ])->toArray();

            Log::info('Formatted shipping rates', ['formattedRates' => $formattedRates]);

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
