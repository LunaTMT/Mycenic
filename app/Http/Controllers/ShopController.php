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
        \Log::info('shopController@index called');

        try {
            \Log::info('Fetching all items with top-level reviews and users');

            $items = Item::with([
                'reviews' => function ($query) {
                    $query->whereNull('parent_id')->with('user');
                }
            ])->get();

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
}
