<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Item; // Or Product if that's your model name
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        // Select between 1 and 5 random items from DB
        $items = Item::with('images')->inRandomOrder()->take(rand(1, 5))->get();

        // Build cart array with items, quantities, price and weight
        $cartItems = [];
        $subtotal = 0;
        $weight = 0;

        foreach ($items as $item) {
            $qty = rand(1, 3);
            $itemTotal = $item->price * $qty;
            $itemWeight = $item->weight * $qty;

            $cartItems[] = [
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'quantity' => $qty,
                'weight' => $item->weight,
                'total' => $itemTotal,
                'image' => isset($item->images[0]) ? $item->images[0]['url'] ?? null : null,
            ];

            $subtotal += $itemTotal;
            $weight += $itemWeight;
        }

        // Example fixed discount and shipping cost
        $discount = 0; // Or some random discount
        $shipping_cost = max(5, $weight * 0.5); // e.g. 0.5 per unit weight, min 5

        $total = $subtotal - $discount + $shipping_cost;

        return [
            // User is assigned later when creating orders per user
            'user_id' => User::factory(), // fallback if user_id is not set explicitly
            'cart' => $cartItems,
            'returnable_cart' => $cartItems,
            'subtotal' => round($subtotal, 2),
            'weight' => round($weight, 2),
            'discount' => round($discount, 2),
            'shipping_cost' => round($shipping_cost, 2),
            'total' => round($total, 2),
            'payment_status' => $this->faker->randomElement(['PENDING', 'PAID', 'FAILED']),
            'shipping_status' => $this->faker->randomElement(['PRE-TRANSIT', 'DELIVERED', 'IN-TRANSIT']),
            'carrier' => $this->faker->randomElement(['DHL', 'FedEx', 'UPS', null]),
            'tracking_number' => $this->faker->optional()->uuid,
            'tracking_url' => $this->faker->optional()->url,
            'tracking_history' => null,
            'label_url' => null,
            'shipment_id' => null,
            'legal_agreement' => true,
            'is_completed' => $this->faker->boolean(70),
            'returnable' => true,
            'return_status' => $this->faker->randomElement(['UNKNOWN', 'REQUESTED', 'APPROVED', 'DENIED']),
        ];
    }
}
