<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\Cart\CartService;

use App\Services\User\UserContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected UserContextService $userContext
    ) {
        $this->middleware('auth')->except(['show', 'index']);
    }

    public function index()
    {
        Log::info('Cart index viewed', ['user' => Auth::id() ?? 'guest']);
        return Inertia::render('Cart/Cart');
    }

    public function show(Request $request)
    {
        $cart = $this->cartService->getCartForRequest($request, $this->userContext);

        Log::info('Cart shown', [
            'user' => Auth::id() ?? 'guest',
            'cart_id' => $cart->id ?? null,
        ]);

        return response()->json(['cart' => $cart]);
    }

    private function handleCartAction(Request $request, string $action, ?int $itemId = null)
    {
        $this->userContext->ensureAuthenticated();

        $cart = $this->cartService->getCartForRequest($request, $this->userContext);

        $cart = match ($action) {
            'add'    => $this->cartService->addItemForRequest($request, $this->userContext, $cart),
            'update' => $this->cartService->updateItemForRequest($request, $itemId, $this->userContext, $cart),
            'remove' => $this->cartService->removeItemForRequest($request, $itemId, $this->userContext, $cart),
            'clear'  => $this->cartService->clearCartForRequest($request, $this->userContext, $cart),
        };

        Log::info("Cart action completed: {$action}", [
            'user' => Auth::id(),
            'cart_id' => $cart->id ?? null,
            'item_id' => $itemId,
            'subtotal' => $cart->subtotal ?? null,
            'total' => $cart->total ?? null,
        ]);

        return response()->json([
            'cart' => $cart,
            'message' => $action === 'clear' ? 'Cart cleared successfully.' : null,
        ]);
    }

    public function store(Request $request)                 { return $this->handleCartAction($request, 'add'); }
    public function update(Request $request, int $itemId)   { return $this->handleCartAction($request, 'update', $itemId); }
    public function destroy(Request $request, int $itemId)  { return $this->handleCartAction($request, 'remove', $itemId); }
    public function clear(Request $request)                 { return $this->handleCartAction($request, 'clear'); }
}