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

class ItemController extends Controller
{
    public function index(Request $request)
    {
        try {
            $category = $request->query('category', 'ALL');
            $sort = $request->query('sort', 'Newest');
            $filter = $request->query('filter'); // Add this line
            $showFilter = $request->query('showFilter');
    
            $query = Item::query();
    
            if ($category !== 'ALL') {
                $query->where('category', $category);
            }
    
            if ($filter === 'new') {
                $query->orderBy('created_at', 'desc');
            } elseif ($filter === 'best-sellers') {
                $query->orderBy('stock', 'asc'); // You can define how to decide "best sellers"
            } elseif ($filter === 'price-asc') {
                $query->orderBy('price', 'asc');
            } elseif ($filter === 'price-desc') {
                $query->orderBy('price', 'desc');
            } else {
                // fallback sorting
                if ($sort === 'LOW - HIGH') {
                    $query->orderBy('price', 'asc');
                } elseif ($sort === 'HIGH - LOW') {
                    $query->orderBy('price', 'desc');
                } else {
                    $query->orderBy('created_at', 'desc');
                }
            }
    
            $items = $query->select('id', 'name', 'price', 'images', 'weight', 'stock',  'isPsyilocybinSpores')->get();
    
            Log::info('Items fetched from database:', $items->toArray());
    
            return Inertia::render('Shop/Shop', [
                'items' => $items,
                'category' => $category,
                'showFilter' => $showFilter,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching items: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch items'], 500);
        }
    }
    
    

    public function store(Request $request)
    {
        try {
            Log::info('Store method called.');

            // Validate input data
            $data = $request->validate([
                'name'      => 'required|string|max:255',
                'category'  => 'nullable|string',
                'price'     => 'required|numeric',
                'description' => 'nullable|string|max:1000',
                'stock'     => 'nullable|integer',
                'images'    => 'nullable|array|max:5',
                'images.*'  => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'weight'    => 'nullable|numeric', // Validate weight
            ]);

            Log::info('Validated data: ', $data);

            // Create the item in the database
            $item = Item::create([
                'name'        => $data['name'],
                'category'    => $data['category'] ?? 'Uncategorized',
                'price'       => $data['price'],
                'description' => $data['description'] ?? null,
                'stock'       => $data['stock'] ?? 0,
                'weight'      => $data['weight'] ?? 0, // Store weight
            ]);

            Log::info('Item created: ', $item->toArray());

            // Handle the images if any are uploaded
            if ($request->hasFile('images')) {
                $imagePaths = [];
                foreach ($request->file('images') as $index => $image) {
                    $imageName = $index . '.' . $image->getClientOriginalExtension();
                    $path = $image->move(public_path('assets/images/products/' . $item->id), $imageName);
                    $imagePaths[] = 'assets/images/products/' . $item->id . '/' . $imageName;
                }
                $item->images = json_encode($imagePaths);
                $item->save();

                Log::info('Images saved: ', $imagePaths);
            }

            // Register the product and price in Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? "Category: " . ($data['category'] ?? 'Uncategorized'),
            ]);

            Log::info('Stripe product created: ', $product->toArray());

            $price = Price::create([
                'unit_amount' => intval($data['price'] * 100), // Convert to cents
                'currency' => 'gbp',
                'product' => $product->id,
            ]);

            Log::info('Stripe price created: ', $price->toArray());

            // Save Stripe product and price IDs in the database
            $item->stripe_product_id = $product->id;
            $item->stripe_price_id = $price->id;
            $item->save();

            Log::info('Redirecting to Shop.');
            $items = Item::all();

            return Inertia::render('Shop', [
                'message' => 'Item added successfully and registered with Stripe.',
                'items' => $items,
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing item: ' . $e->getMessage());
            return Inertia::render('Shop/AddItem', [
                'error' => 'Unable to store item',
            ]);
        }
    }

    public function show($id)
    {
        try {
            $item = Item::findOrFail($id);

            // Retrieve the corresponding product and price from Stripe
            Stripe::setApiKey(env('STRIPE_SECRET'));

            $product = Product::retrieve($item->stripe_product_id);
            $price = Price::retrieve($item->stripe_price_id);

            return response()->json([
                'item' => $item,
                'stripe_product' => $product,
                'stripe_price' => $price,
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving item: ' . $e->getMessage());
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

