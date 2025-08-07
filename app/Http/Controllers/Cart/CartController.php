<?php


namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;


class CartController extends Controller
{
    // Show the cart page using Inertia
    public function index(Request $request)
    {
        $cart = session('cart', []);
        return Inertia::render('Cart/Cart', [
            'cart' => $cart,
        ]);
    }

    // Return cart data as JSON (for frontend use)
    public function getCartData(Request $request)
    {
        if (Auth::check()) {
            $userId = Auth::id();
            $cart = Cart::with(['cartItems.item.images', 'shippingAddresses'])->firstOrCreate(
                ['user_id' => $userId, 'status' => 'active']
            );
        } else {
            $guestToken = $request->session()->get('guest_cart_token');

            if (!$guestToken) {
                $guestToken = (string) \Str::uuid();
                $request->session()->put('guest_cart_token', $guestToken);
            }

            $cart = Cart::with(['cartItems.item.images', 'shippingAddresses'])->firstOrCreate(
                ['guest_token' => $guestToken, 'status' => 'active']
            );
        }

        return response()->json($cart);
    }

    
    // Add item to cart
    public function addToCart(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'name' => 'required|string',
            'price' => 'required|numeric',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('cart', []);

        $id = $request->input('id');

        if (isset($cart[$id])) {
            $cart[$id]['quantity'] += $request->input('quantity');
        } else {
            $cart[$id] = [
                'id' => $id,
                'name' => $request->input('name'),
                'price' => $request->input('price'),
                'quantity' => $request->input('quantity'),
            ];
        }

        session()->put('cart', $cart);

        return response()->json(['message' => 'Item added to cart', 'cart' => $cart]);
    }

    // Remove item from cart
    public function removeFromCart(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
        ]);

        $cart = session()->get('cart', []);
        unset($cart[$request->input('id')]);

        session()->put('cart', $cart);

        return response()->json(['message' => 'Item removed from cart', 'cart' => $cart]);
    }

    // Clear the cart
    public function clearCart()
    {
        session()->forget('cart');

        return response()->json(['message' => 'Cart cleared']);
    }
}
