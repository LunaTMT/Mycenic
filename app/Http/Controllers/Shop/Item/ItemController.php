<?php

namespace App\Http\Controllers\Shop\Item;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Services\ItemService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;

class ItemController extends Controller
{
    protected ItemService $service;

    public function __construct(ItemService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $this->authorize('viewAny', Item::class);

        $items = Item::with('images')->get();
        return Inertia::render('Shop/Item/ItemIndex', compact('items'));
    }

    public function create()
    {
        $this->authorize('create', Item::class);
        return Inertia::render('Shop/Item/ItemCreate');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Item::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:items,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'isPsyilocybinSpores' => 'nullable|boolean',
        ]);

        try {
            $item = $this->service->create($validated);
            return redirect()->route('shop.index')->with('message', 'Item created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating item: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Unable to create item.');
        }
    }

    public function show(Item $item)
    {
        $this->authorize('view', $item);

        $item->load([
            'images',
            'reviews' => function ($query) {
                $query->whereNull('parent_id')
                      ->with(['user.avatar', 'images', 'replies.user.avatar', 'replies.images', 'replies.replies']);
            },
        ]);

        return Inertia::render('Shop/Item/ItemPage', compact('item'));
    }

    public function edit(Item $item)
    {
        $this->authorize('update', $item);
        return Inertia::render('Shop/Item/ItemEdit', compact('item'));
    }

    public function update(Request $request, Item $item)
    {
        $this->authorize('update', $item);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:items,name,' . $item->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'weight' => 'sometimes|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'isPsyilocybinSpores' => 'nullable|boolean',
        ]);

        try {
            $this->service->update($item, $validated);
            return redirect()->route('shop.index')->with('message', 'Item updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating item: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Unable to update item.');
        }
    }

    public function destroy(Item $item)
    {
        $this->authorize('delete', $item);

        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));
            if ($item->stripe_product_id) {
                $product = Product::retrieve($item->stripe_product_id);
                $product->active = false;
                $product->save();
            }

            if ($item->stripe_price_id) {
                $price = Price::retrieve($item->stripe_price_id);
                $price->active = false;
                $price->save();
            }

            $this->service->delete($item);
            return redirect()->route('shop.index')->with('message', 'Item deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting item: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Unable to delete item.');
        }
    }
}
