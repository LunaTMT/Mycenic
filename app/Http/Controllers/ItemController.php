<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;
use Stripe\Subscription;
use App\Models\Review;

class ItemController extends Controller
{

    public function index(Request $request)
    {
        \Log::info('ItemController@index called');

        try {
            \Log::info('Fetching all items with reviews and users');

            $items = Item::with(['reviews.user'])->get();

            \Log::info('Items fetched successfully', ['count' => $items->count()]);

            return Inertia::render('Shop/ShopFront/ShopFront', [
                'items' => $items,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching items in ItemController@index', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Unable to fetch items'], 500);
        }
    }



    
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category' => 'nullable|string|max:255',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string',
            ]);

            $item = new Item($validated);

            if ($request->has('images')) {
                $item->images = json_encode($request->input('images'));
            }

            $item->save();

            return redirect()
                ->route('shop.index')
                ->with('flash.success', 'Item created successfully.');

        } catch (\Exception $e) {
            return redirect()
                ->route('shop.add')
                ->with('flash.error', 'Unable to store item');
        }
    }

    public function show($id)
    {
        \Log::info("Fetching item with ID: {$id}");

        try {
            // Eager load relationships
            $item = Item::with([
                'reviews.user',
                'reviews.images',
                'reviews.replies.user',
            ])->findOrFail($id);

      

            return Inertia::render('Shop/Item/ItemPage', [
                'item' => $item
            ]);

        } catch (\Exception $e) {
            \Log::error('Error retrieving item or Stripe data', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Unable to retrieve item'], 500);
        }
    }




    public function update(Request $request, $id)
    {
        try {
            $item = Item::findOrFail($id);
            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric',
                'stock' => 'sometimes|integer',
                'weight' => 'sometimes|numeric', // Update weight if needed
            ]);
    
            $item->update($data);
    
            if ($request->has('current_url')) {
                $currentUrl = $request->input('current_url');
                return redirect($currentUrl)->with('message', 'Stock updated successfully.');
            }
    
            return redirect()->route('item', ['id' => $item->id]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to update item'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Find the item to delete
            $item = Item::findOrFail($id);
    
            // Delete associated images
            if ($item->images) {
                $imagePaths = json_decode($item->images);
                foreach ($imagePaths as $path) {
                    if (File::exists(public_path($path))) {
                        File::delete(public_path($path));
                    }
                }
            }
    
            // Deactivate the Stripe product and price
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $product = Product::retrieve($item->stripe_product_id);
            $product->active = false;
            $product->save();
    
            $price = Price::retrieve($item->stripe_price_id);
            $price->active = false;
            $price->save();
    
            // Delete the item
            $item->delete();
    
            Log::info('Item deleted: ' . $id);
    
            // Retrieve the updated list of items
            $items = Item::all();

            return redirect()->route('shop')->with('message', 'Item successfully deleted from Stripe and database.');
        } catch (\Exception $e) {
            Log::error('Error deleting item: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to delete item'], 500);
        }
    }

    public function getStock($id)
    {
        try {
            $item = Item::findOrFail($id);
            return response()->json(['stock' => $item->stock]);
        } catch (\Exception $e) {
            Log::error("Error fetching stock for item ID $id: " . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch stock'], 500);
        }
    }
}

