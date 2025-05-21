<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Shippo_Shipment;
use Shippo_Transaction;
use Shippo_Track;
use Shippo;

class ShippoService
{
    public function __construct()
    {
        Shippo::setApiKey(config('services.shippo.api_key'));
        Log::info('Shippo API key set.');
    }

    private $allowedCountries = ['GB']; 

    public function createShipment($order)
    {
        Log::info('Creating shipment for order:', $order->toArray());

        if (!in_array($order->country, $this->allowedCountries)) {
            Log::error('Shipping not available for this country.', ['country' => $order->country]);
            return null;
        }

        $fromAddress = [
            'name'    => 'Mycenic',
            'street1' => '126 Henry Shuttlewood Drive',
            'city'    => 'Chelmsford',
            'country' => 'GB',
            'zip' => 'CM1 6EQ',
            'phone'   => '+44 15555555555',
            'email'   => 'support@mycenic.com'
        ];

        $toAddress = [
            'name'    => $order->customer_name,
            'street1' => $order->address,
            'city'    => $order->city,
            'country' => $order->country,
            'zip'     => $order->zip,
            'phone'   => $order->phone,
            'email'   => $order->email
        ];

        $parcel = [
            'length'  => '10',
            'width'   => '10',
            'height'  => '5',
            'distance_unit' => 'in',
            'weight'  => '2',
            'mass_unit' => 'lb'
        ];

        try {
            $shipment = Shippo_Shipment::create([
                'address_from' => $fromAddress,
                'address_to'   => $toAddress,
                'parcels'      => [$parcel],
                'async'        => false
            ]);

            
            return $shipment;
        } catch (\Exception $e) {
            
            return null;
        }
    }

    public function getRates($order)
    {
        

        $shipment = $this->createShipment($order);

        if ($shipment) {
           
            return $shipment['rates'];
        } else {
            Log::error('Failed to fetch shipping rates.', ['order_id' => $order->id]);
            return null;
        }
    }

    public function purchaseLabel($rateId)
    {
        Log::info('Purchasing label for rate.', ['rate_id' => $rateId]);

        try {
            $transaction = Shippo_Transaction::create([
                'rate'  => $rateId,
                'async' => false
            ]);
            
     
            return $transaction;
        } catch (\Exception $e) {
            Log::error('Error purchasing Shippo label', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return null;
        }
    }


    public function trackShipment($carrier, $trackingNumber)
    {
        try {
            \Shippo::setApiKey(env('SHIPPO_API_KEY'));
    
            $tracking = \Shippo_Track::create([
                'carrier' => $carrier,
                'tracking_number' => $trackingNumber
            ]);
    

            return $tracking;
        } catch (\Exception $e) {
            Log::error('Error tracking shipment.', [
                'carrier' => $carrier,
                'tracking_number' => $trackingNumber,
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
    
            return null;
        }
    }

    public function validateAddress(array $addressData): array
    {
        Log::info('Validating shipping address', ['input' => $addressData]);
    
        try {
            $address = \Shippo_Address::create([
                'name' => $addressData['name'],
                'street1' => $addressData['address'],
                'city' => $addressData['city'],
                'zip' => $addressData['zip'],
                'country' => 'GB',
                'email' => $addressData['email'],
                'validate' => true,
            ]);
    
            Log::info('Shippo address response', ['address' => $address]);
    
            if (!empty($address['validation_results']) && $address['validation_results']['is_valid']) {
                Log::info('Address validation passed.');
                return ['valid' => true];
            }
    
            $messages = $address['validation_results']['messages'] ?? [];
            Log::warning('Address validation failed', ['messages' => $messages]);
    
            return [
                'valid' => false,
                'messages' => $messages,
            ];
        } catch (\Exception $e) {
            Log::error('Error during Shippo address validation', ['error' => $e->getMessage()]);
            return [
                'valid' => false,
                'messages' => ['An error occurred while validating the address.'],
            ];
        }
    }
 
    
}
