<?php

namespace App\Services\Cart;

use App\Models\Cart\Cart;
use App\Models\Cart\CartItem;
use Illuminate\Http\Request;
use App\Services\User\UserContextService;


class CartService
{
    public function getCartForRequest(Request $request, UserContextService $userContext): Cart
    {
        $userId = $userContext->getTargetUser($request)->id;
        return $userId ? $this->getCartForUser($userId) : $this->getEmptyCart();
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
            'subtotal' => 0,
            'total' => 0,
            'discount' => 0,
            'shipping_cost' => 0,
            'weight' => 0,
            'status' => 'active',
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

        return $cart->items->first(fn($ci) =>
            $ci->item_id === $itemId &&
            $this->normalizeOptions($ci->selected_options ?? []) === $options
        );
    }

    public function addItem(Cart $cart, int $itemId, int $quantity = 1, array $options = []): void
    {
        $cartItem = $this->findCartItem($cart, $itemId, $options);

        if ($cartItem) {
            $cartItem->increment('quantity', $quantity);
        } else {
            $cart->items()->create([
                'item_id' => $itemId,
                'quantity' => $quantity,
                'selected_options' => $this->normalizeOptions($options),
            ]);
        }

        $this->recalculateCart($cart);
    }

    public function updateItem(Cart $cart, int $itemId, int $quantity, array $options = []): void
    {
        if ($cartItem = $this->findCartItem($cart, $itemId, $options)) {
            $cartItem->update([
                'quantity' => $quantity,
                'selected_options' => $this->normalizeOptions($options),
            ]);
        }

        $this->recalculateCart($cart);
    }

    public function removeItem(Cart $cart, int $itemId, array $options = []): void
    {
        $this->findCartItem($cart, $itemId, $options)?->delete();
        $this->recalculateCart($cart);
    }

    public function recalculateCart(Cart $cart): void
    {
        $subtotal = $weight = 0;

        foreach ($cart->items as $item) {
            $subtotal += $item->item->price * $item->quantity;
            $weight += $item->item->weight * $item->quantity;
        }

        $shipping = $this->calculateShippingCost($weight);
        $discount = $cart->discount ?? 0;

        $cart->update([
            'subtotal' => $subtotal,
            'weight' => $weight,
            'shipping_cost' => $shipping,
            'total' => $subtotal - $discount + $shipping,
        ]);
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

    private function performActionForRequest(Request $request, UserContextService $userContext, string $method, ?int $itemId = null): Cart
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

    public function addItemForRequest(Request $request, UserContextService $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'add');
    }

    public function updateItemForRequest(Request $request, int $itemId, UserContextService $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'update', $itemId);
    }

    public function removeItemForRequest(Request $request, int $itemId, UserContextService $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'remove', $itemId);
    }

    public function clearCartForRequest(Request $request, UserContextService $userContext, ?Cart $cart = null): Cart
    {
        return $this->performActionForRequest($request, $userContext, 'clear');
    }
}
