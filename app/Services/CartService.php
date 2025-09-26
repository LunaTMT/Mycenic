<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartService
{
    public function getCartForRequest(Request $request, ?UserContext $userContext = null): Cart
    {
        $user = $userContext?->getAuthUser() ?? auth()->user();
        $userId = $userContext?->getTargetUserId($request) ?? optional($user)->id;

        return $user ? $this->getCartForUser($userId) : $this->getEmptyCart();
    }

    public function getCartForUser(int $userId): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $userId, 'status' => 'active'],
            ['subtotal' => 0, 'total' => 0, 'discount' => 0, 'shipping_cost' => 0, 'weight' => 0]
        )->load('items.item');
    }

    public function getEmptyCart(): Cart
    {
        return new Cart([
            'subtotal'      => 0,
            'total'         => 0,
            'discount'      => 0,
            'shipping_cost' => 0,
            'weight'        => 0,
            'status'        => 'active',
        ]);
    }

    protected function normalizeOptions(array $options): array
    {
        ksort($options);
        return $options;
    }

    protected function findCartItem(Cart $cart, int $itemId, array $options = []): ?CartItem
    {
        $options = $this->normalizeOptions($options);
        foreach ($cart->items as $cartItem) {
            if ($cartItem->item_id === $itemId &&
                $this->normalizeOptions($cartItem->selected_options ?? []) === $options) {
                return $cartItem;
            }
        }
        return null;
    }

    public function addItem(Cart $cart, int $itemId, int $quantity = 1, array $options = []): void
    {
        $cartItem = $this->findCartItem($cart, $itemId, $options);
        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cart->items()->create([
                'item_id'          => $itemId,
                'quantity'         => $quantity,
                'selected_options' => $this->normalizeOptions($options),
            ]);
        }
        $this->recalculateCart($cart);
    }

    public function updateItem(Cart $cart, int $itemId, int $quantity, array $options = []): void
    {
        $cartItem = $this->findCartItem($cart, $itemId, $options);
        if ($cartItem) {
            $cartItem->quantity = $quantity;
            $cartItem->selected_options = $this->normalizeOptions($options);
            $cartItem->save();
        }
        $this->recalculateCart($cart);
    }

    public function removeItem(Cart $cart, int $itemId, array $options = []): void
    {
        $cartItem = $this->findCartItem($cart, $itemId, $options);
        $cartItem?->delete();
        $this->recalculateCart($cart);
    }

    public function recalculateCart(Cart $cart): void
    {
        $subtotal = 0;
        $weight = 0;
        foreach ($cart->items as $item) {
            $subtotal += $item->item->price * $item->quantity;
            $weight += $item->item->weight * $item->quantity;
        }
        $cart->subtotal = $subtotal;
        $cart->weight = $weight;
        $cart->shipping_cost = $this->calculateShippingCost($weight);
        $cart->discount = $cart->discount ?? 0;
        $cart->total = $subtotal - $cart->discount + $cart->shipping_cost;
        $cart->save();
    }

    private function calculateShippingCost(float $weight): float
    {
        return match (true) {
            $weight <= 0 => 0,
            $weight <= 1 => 5.00,
            $weight <= 5 => 10.00,
            default => 20.00,
        };
    }

    private function performActionForRequest(Request $request, UserContext $userContext, string $method, ?int $itemId = null): Cart
    {
        $cart = $this->getCartForRequest($request, $userContext);

        match ($method) {
            'add'    => $this->addItem($cart, $request->input('item_id'), $request->input('quantity', 1), $request->input('selected_options', [])),
            'update' => $this->updateItem($cart, $itemId, $request->input('quantity', 1), $request->input('selected_options', [])),
            'remove' => $this->removeItem($cart, $itemId, $request->input('selected_options', [])),
            'clear'  => $cart->items->each->delete(),
        };

        $this->recalculateCart($cart);

        return $cart->fresh('items.item');
    }

    public function addItemForRequest(Request $request, UserContext $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'add');
    }

    public function updateItemForRequest(Request $request, int $itemId, UserContext $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'update', $itemId);
    }

    public function removeItemForRequest(Request $request, int $itemId, UserContext $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'remove', $itemId);
    }

    public function clearCartForRequest(Request $request, UserContext $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'clear');
    }
}
