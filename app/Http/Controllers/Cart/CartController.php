<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\UserContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    protected CartService $cartService;
    protected UserContext $userContext;

    public function __construct(CartService $cartService, UserContext $userContext)
    {
        $this->cartService = $cartService;
        $this->userContext = $userContext;
        $this->middleware('auth')->except(['show', 'index']);
    }

    public function index()
    {
        $userId = Auth::id() ?? 'guest';
        Log::info('Cart index viewed', ['user' => $userId]);

        return Inertia::render('Cart/Cart');
    }

    public function show(Request $request)
    {
        $cart = $this->cartService->getCartForRequest($request, $this->userContext);
        $userId = Auth::id() ?? 'guest';

        Log::info('Cart shown', [
            'user' => $userId,
            'cart_id' => $cart->id ?? null,
        ]);

        return response()->json(['cart' => $cart]);
    }

    private function handleCartAction(Request $request, string $action, ?int $itemId = null)
    {
        $this->userContext->ensureAuthenticated();
        $userId = Auth::id();

        Log::info("Starting cart action: {$action}", [
            'user' => $userId,
            'item_id' => $itemId,
            'request_data' => $request->all(),
        ]);

        $cart = $this->cartService->getCartForRequest($request, $this->userContext);
        $this->authorize($action, $cart);

        $cart = match ($action) {
            'addItem'    => $this->cartService->addItemForRequest($request, $this->userContext, $cart),
            'update'     => $this->cartService->updateItemForRequest($request, $itemId, $this->userContext, $cart),
            'removeItem' => $this->cartService->removeItemForRequest($request, $itemId, $this->userContext, $cart),
            'clear'      => $this->cartService->clearCartForRequest($request, $this->userContext, $cart),
        };

        Log::info("Completed cart action: {$action}", [
            'user' => $userId,
            'cart_id' => $cart->id ?? null,
            'item_id' => $itemId,
            'cart_subtotal' => $cart->subtotal ?? null,
            'cart_total' => $cart->total ?? null,
        ]);

        return response()->json([
            'cart' => $cart,
            'message' => $action === 'clear' ? 'Cart cleared successfully.' : null,
        ]);
    }

    public function store(Request $request)
    {
        return $this->handleCartAction($request, 'addItem');
    }

    public function update(Request $request, int $itemId)
    {
        return $this->handleCartAction($request, 'update', $itemId);
    }

    public function destroy(Request $request, int $itemId)
    {
        return $this->handleCartAction($request, 'removeItem', $itemId);
    }

    public function clear(Request $request)
    {
        return $this->handleCartAction($request, 'clear');
    }
}
