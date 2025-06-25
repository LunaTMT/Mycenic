<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Shippo;
use Shippo_Shipment;
use Shippo_Transaction;
use Shippo_Track;
use Shippo_Address;

use App\Models\Order;
use App\Models\ReturnModel;

class ShippoService
{
    private $allowedCountries = ['GB'];

    public function __construct()
    {
        \Shippo::setApiKey(config('services.shippo.key'));
    }

     private function buildShipmentData(array $from, array $to, float $weight): array
    {
        return [
            'address_from' => $from,
            'address_to' => $to,
            'parcels' => [[
                'length' => '10',
                'width' => '10',
                'height' => '5',
                'distance_unit' => 'in',
                'weight' => (string) $weight,
                'mass_unit' => 'lb',
            ]],
            'async' => false,
        ];
    }


    public function createOrderShipment(object $data)
    {
        if (!in_array($data->country, $this->allowedCountries)) {
            Log::error('Order shipping not available for this country.', ['country' => $data->country]);
            return null;
        }

        $warehouseAddress = [
            'name'    => 'Mycenic Warehouse',
            'street1' => '126 Henry Shuttlewood Drive',
            'city'    => 'Chelmsford',
            'zip'     => 'CM1 6EQ',
            'country' => 'GB',
            'phone'   => '+44 15555555555',
            'email'   => 'support@mycenic.com',
        ];

        $customerAddress = [
            'name'    => $data->customer_name,
            'street1' => $data->address,
            'city'    => $data->city,
            'zip'     => $data->zip,
            'country' => $data->country,
            'phone'   => $data->phone,
            'email'   => $data->email,
        ];

        $shipmentData = $this->buildShipmentData($warehouseAddress, $customerAddress, $data->weight ?? 2);

        return $this->createShipment($shipmentData);
    }


    public function createReturnShipment(ReturnModel $return, string $selectedRateId)
    {
        if (!in_array($return->country, $this->allowedCountries)) {
            Log::error('Return shipping not available for this country.', ['country' => $return->country]);
            return null;
        }

        $warehouseAddress = [
            'name'    => 'Mycenic Warehouse',
            'street1' => '126 Henry Shuttlewood Drive',
            'city'    => 'Chelmsford',
            'zip'     => 'CM1 6EQ',
            'country' => 'GB',
            'phone'   => '+44 15555555555',
            'email'   => 'support@mycenic.com',
        ];

        $customerAddress = [
            'name'    => $return->customer_name,
            'street1' => $return->address,
            'city'    => $return->city,
            'zip'     => $return->zip,
            'country' => $return->country,
            'phone'   => $return->phone,
            'email'   => $return->email,
        ];

        $weight = $return->weight ?? 2;

        $shipmentData = $this->buildShipmentData($customerAddress, $warehouseAddress, $weight);

        $shipment = $this->createShipment($shipmentData);

        if (!$shipment) {
            Log::error('Failed to create shipment for return ID: ' . $return->id);
            throw new \Exception('Failed to create shipment');
        }

        if (empty($shipment['rates'])) {
            Log::error('No shipping rates returned for return ID: ' . $return->id);
            throw new \Exception('No shipping rates available');
        }

        // Find the rate the customer selected
        $selectedRate = collect($shipment['rates'])->firstWhere('object_id', $selectedRateId);

        if (!$selectedRate) {
            Log::error('Selected shipping rate not found for return ID: ' . $return->id, ['selected_rate_id' => $selectedRateId]);
            throw new \Exception('Selected shipping rate not found');
        }

        // Purchase the label with the selected rate
        $label = $this->purchaseLabel($selectedRate['object_id']);

        // Update the ReturnModel with shipment and label info
        $return->shipment_id     = $shipment['object_id'] ?? null;
        $return->carrier         = $label['carrier'] ?? null;
        $return->tracking_number = $label['tracking_number'] ?? null;
        $return->label_url       = $label['label_url'] ?? null;
        $return->tracking_url    = $label['label_url'] ?? null; // or a tracking URL if available
        $return->shipping_option = [
            'provider' => $selectedRate['provider'] ?? null,
            'service'  => $selectedRate['servicelevel']['name'] ?? null,
            'amount'   => $selectedRate['amount'] ?? null,
            'currency' => $selectedRate['currency'] ?? null,
            'object_id'=> $selectedRate['object_id'] ?? null,
        ];
        $return->shipping_status = 'LABEL_PURCHASED';

        // Save updated return record
        $return->save();

        return $return;
    }


    public function createShipment(array $data)
    {
        Log::info('Creating shipment with request data:', $data);

        if (!in_array($data['address_to']['country'], $this->allowedCountries)) {
            Log::error('Shipping not available for this country.', ['country' => $data['address_to']['country']]);
            return null;
        }

        try {
            $shipment = \Shippo_Shipment::create([
                'address_from' => $data['address_from'],
                'address_to'   => $data['address_to'],
                'parcels'      => $data['parcels'] ?? [[
                    'length' => '10',
                    'width'  => '10',
                    'height' => '5',
                    'distance_unit' => 'in',
                    'weight' => '2',
                    'mass_unit' => 'lb'
                ]],
                'async' => false,
            ]);

            return $shipment;
        } catch (\Exception $e) {
            Log::error('Error creating shipment: ' . $e->getMessage());
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

    public function getShippingRates(array $from, array $to, array $parcel): ?array
    {
        try {
            $shipment = Shippo_Shipment::create([
                'address_from' => $from,
                'address_to' => $to,
                'parcels' => [$parcel],
                'async' => false,
            ]);

            if (!empty($shipment['rates'])) {
                return $shipment['rates'];
            }

            Log::error('No rates returned from Shippo.', ['shipment' => $shipment]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error fetching shipping rates.', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function purchaseLabel(string $rateId)
    {
        if (!$rateId) {
            throw new \InvalidArgumentException('rate_id is required');
        }

        try {
            $transaction = Shippo_Transaction::create([
                'rate' => $rateId,
                'label_file_type' => 'PDF',
                'async' => false
            ]);

            if ($transaction['status'] !== 'SUCCESS') {
                \Log::error('Label purchase failed.', ['transaction' => $transaction]);
                throw new \Exception('Label purchase failed');
            }

            return [
                'label_url' => $transaction['label_url'],
                'tracking_number' => $transaction['tracking_number'],
                'carrier' => $transaction['carrier'],
                'shipment_id' => $transaction['shipment'],
                'transaction_id' => $transaction['object_id']
            ];
        } catch (\Exception $e) {
            \Log::error('Exception during label purchase: ' . $e->getMessage());
            throw $e;  // Let controller handle the exception
        }
    }


    public function trackShipment($carrier, $trackingNumber)
    {
        try {
            \Shippo::setApiKey(env('SHIPPO_API_KEY'));

            $tracking = Shippo_Track::create([
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
            $address = Shippo_Address::create([
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
