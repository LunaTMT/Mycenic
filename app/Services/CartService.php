<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;

class CartService
{
    /**
     * Get the active cart for a user or guest.
     * If $userId is null, this returns a guest cart.
     */
    public function getCartForUser(?int $userId): Cart
    {
        return Cart::with('items.item')->firstOrCreate(
            ['user_id' => $userId, 'status' => 'active'],
            ['subtotal' => 0, 'total' => 0]
        );
    }

    /**
     * Get an empty cart for guests (no user_id)
     */
    public function getEmptyCart(): Cart
    {
        return new Cart([
            'items' => [],
            'subtotal' => 0,
            'total' => 0,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Add an item to the cart.
     */
    public function addItem(Cart $cart, int $itemId, int $quantity = 1, array $options = []): CartItem
    {
        $quantity = max(1, $quantity);

        // Check if the same item with the same options already exists
        $cartItem = $cart->items()->where('item_id', $itemId)
            ->where('selected_options', $options)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = $cart->items()->create([
                'item_id' => $itemId,
                'quantity' => $quantity,
                'selected_options' => $options,
            ]);
        }

        $cart->load('items.item');
        $this->recalculateCart($cart);

        return $cartItem;
    }

    /**
     * Update the quantity or options of a cart item
     */
    public function updateItem(Cart $cart, int $itemId, int $quantity, array $options = [])
    {
        $quantity = max(1, $quantity);

        $cartItem = $cart->items()->where('item_id', $itemId)
            ->where('selected_options', $options)
            ->first();

        if ($cartItem) {
            $cartItem->quantity = $quantity;
            $cartItem->save();
            $cart->load('items.item');
            $this->recalculateCart($cart);
        }

        return $cartItem;
    }

    /**
     * Remove an item from the cart
     */
    public function removeItem(Cart $cart, int $itemId, array $options = [])
    {
        $cartItem = $cart->items()->where('item_id', $itemId)
            ->where('selected_options', $options)
            ->first();

        if ($cartItem) {
            $cartItem->delete();
            $cart->load('items.item');
            $this->recalculateCart($cart);
        }
    }

    /**
     * Clear all items from the cart
     */
    public function clearCart(Cart $cart)
    {
        $cart->items()->delete();
        $cart->update([
            'subtotal' => 0,
            'total' => 0,
            'discount' => null,
            'shipping_cost' => null,
        ]);
    }

    /**
     * Recalculate subtotal and total for the cart
     */
    public function recalculateCart(Cart $cart)
    {
        $subtotal = $cart->items->sum(fn($item) => $item->quantity * ($item->item->price ?? 0));
        $total = $subtotal - ($cart->discount ?? 0) + ($cart->shipping_cost ?? 0);

        $cart->update([
            'subtotal' => $subtotal,
            'total' => max($total, 0),
        ]);
    }

    /**
     * Checkout the cart
     *
     * Marks the current cart as checked_out and creates a new active cart
     */
    public function checkoutCart(Cart $cart): Cart
    {
        return DB::transaction(function () use ($cart) {
            $this->recalculateCart($cart);

            $cart->update(['status' => 'checked_out']);

            return Cart::create([
                'user_id' => $cart->user_id,
                'subtotal' => 0,
                'total' => 0,
                'status' => 'active',
            ]);
        });
    }
}
