<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShippingRatesController;



Route::post('/shipping/rates', [ShippingRatesController::class, 'getRates']);