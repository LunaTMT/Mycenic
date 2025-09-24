<?php

namespace App\Http\Controllers\Shop;

use Inertia\Inertia;
use App\Models\Item;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        try {
            $items = Item::all(); // Fetch all items

            return Inertia::render('Shop/ShopFront/ShopFront', [
                'items' => $items,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching items in ShopController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Unable to fetch items'], 500);
        }
    }
}
