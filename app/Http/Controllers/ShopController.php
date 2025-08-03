<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('ShopController@index called');

        try {
            \Log::info('Fetching all items with top-level reviews, users, and images');

            $items = Item::with([
                'reviews' => function ($query) {
                    $query->whereNull('parent_id')->with('user');
                },
                'images',  // <-- Eager load images relation here
            ])->get();

            \Log::info('Items fetched successfully', ['count' => $items->count()]);

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
