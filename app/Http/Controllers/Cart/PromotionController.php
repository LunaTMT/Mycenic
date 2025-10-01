<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart\Promotion; 
use App\Services\Cart\PromotionService;
use Illuminate\Support\Facades\Log;

class PromotionController extends Controller
{
    protected $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    public function validatePromotion(Request $request)
    {
        Log::info('PromotionController@validatePromotion called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
        ]);

        $request->validate([
            'code' => 'required|string', 
        ]);

        $code = $request->input('code'); 
        $discount = $this->promotionService->validate($code);

        if ($discount !== null) {
            session(['promotion_discount' => $discount]);

            Log::info('Promotion applied successfully', [
                'code' => $code,
                'discount' => $discount,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Promotion applied successfully!',
                'discount' => $discount,
            ]);
        } else {
            session()->forget('promotion_discount');

            Log::warning('Invalid promotion attempt', [
                'code' => $code,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid promotion code.',
            ], 422);
        }
    }
}
