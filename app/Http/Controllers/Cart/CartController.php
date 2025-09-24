<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
        // Only apply middleware for authenticated users, guest users can access the 'show' route without authentication
        $this->middleware('auth')->except(['show']);
    }

    /**
     * Display the current user's cart if logged in, or return an empty cart if guest.
     */
    public function show()
    {
        $user = Auth::user();

        if ($user) {
            // Fetch cart from backend if user is logged in
            $cart = $this->cartService->getCartForUser($user->id);
        } else {
            // Return an empty cart for guests (handled on the frontend with localStorage)
            $cart = $this->cartService->getEmptyCart(); 
        }

        return Inertia::render('Cart/Cart', [
            'cart' => $cart,  // Cart is already eager-loaded in the model
        ]);
    }

    /**
     * Add an item to the cart (for logged-in users).
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'selected_options' => 'nullable|array',
        ]);

        $user = Auth::user();
        if ($user) {
            // For logged-in users, fetch and update the cart in the backend
            $cart = $this->cartService->getCartForUser($user->id);
            $this->authorize('addItem', $cart);
        } else {
            // For guest users, cart can be handled differently (localStorage)
            return response()->json(['message' => 'Guests cannot add items to cart.']);
        }

        // Add item to the cart
        $cartItem = $this->cartService->addItem(
            $cart,
            $request->item_id,
            $request->quantity,
            $request->selected_options ?? []
        );

        return response()->json(['cart_item' => $cartItem], 201);
    }

    /**
     * Update the quantity or options of a cart item (for logged-in users).
     */
    public function update(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'selected_options' => 'sometimes|array',
        ]);

        $user = Auth::user();
        if ($user) {
            // For logged-in users, fetch and update the cart in the backend
            $cart = $this->cartService->getCartForUser($user->id);
            $this->authorize('update', $cart);
        } else {
            return response()->json(['message' => 'Guests cannot update cart items.']);
        }

        $cartItem = $this->cartService->updateItem(
            $cart,
            $itemId,
            $request->quantity ?? 1,
            $request->selected_options ?? []
        );

        return response()->json(['cart_item' => $cartItem]);
    }

    /**
     * Remove an item from the cart (for logged-in users).
     */
    public function destroy($itemId)
    {
        $user = Auth::user();
        if ($user) {
            // For logged-in users, fetch and remove the item from the cart
            $cart = $this->cartService->getCartForUser($user->id);
            $this->authorize('removeItem', $cart);
        } else {
            return response()->json(['message' => 'Guests cannot remove cart items.']);
        }

        $this->cartService->removeItem($cart, $itemId);

        return response()->json(['message' => 'Item removed successfully.']);
    }

    /**
     * Clear the entire cart (for logged-in users).
     */
    public function clear()
    {
        $user = Auth::user();
        if ($user) {
            // For logged-in users, fetch and clear the cart from the backend
            $cart = $this->cartService->getCartForUser($user->id);
            $this->authorize('clear', $cart);
        } else {
            return response()->json(['message' => 'Guests cannot clear the cart.']);
        }

        $this->cartService->clearCart($cart);

        return response()->json(['message' => 'Cart cleared successfully.']);
    }
}
