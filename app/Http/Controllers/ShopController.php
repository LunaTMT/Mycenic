<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Item;
use Illuminate\Support\Facades\Log;

class ShopController extends Controller
{
    public function index()
    {
        try {
            // Fetch all items with reviews and their users (no filtering, no sorting)
            $items = Item::with(['reviews.user'])->get();

            return Inertia::render('Shop/ShopFront/ShopFront', [
                'items' => $items,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching items: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch items'], 500);
        }
    }
}
