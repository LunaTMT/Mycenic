<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\{Item, Order};

use App\Http\Controllers\{
    AddressController,
    ReturnController,
    ReviewController,
    AboutController,
    CartController,
    CheckoutController,
    CustomerController,
    EmailController,
    ItemController,
    OrderController,
    PaymentController,
    ProfileController,
    PromoCodeController,
    ShippingController,
    QuestionController,
    ShopController,
    Auth\AuthenticatedSessionController,
    Auth\SocialAuthController,
    Auth\GoogleController
};

use App\Http\Middleware\AdminMiddleware;

use Stripe\{Stripe, Checkout\Session};

use App\Mail\OrderConfirmation;

/*
|--------------------------------------------------------------------------
| Home & Static Pages
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Home/Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'flash'          => [
            'success' => session('flash.success'),
            'error'   => session('flash.error'),
        ],
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';

Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('login/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('login/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

/*
|--------------------------------------------------------------------------
| Profile & User Management (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('profile.index');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
        Route::patch('/shipping', [ProfileController::class, 'updateShipping'])->name('profile.update-shipping');
        Route::post('/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');

        Route::post('/addresses', [ProfileController::class, 'storeAddress'])->name('profile.addresses.store');
        Route::get('/addresses', [AddressController::class, 'index'])->name('profile.addresses.index');

        Route::get('/shipping-details', function () {
            $user = auth()->user();

            return response()->json([
                'address' => $user->address,
                'city'    => $user->city,
                'zip'     => $user->zip,
            ]);
        })->name('profile.shipping-details');
    });

    Route::get('/user/shipping-address', function () {
        return response()->json(auth()->user()?->only(['name', 'address', 'city', 'zip', 'email']));
    })->name('user.shipping.address');

    Route::get('/user/has-shipping-address', function () {
        $user = auth()->user();
        $requiredFields = ['name', 'address', 'city', 'zip'];
        $hasCompleteAddress = $user && collect($requiredFields)->every(fn($field) => filled($user->$field));

        return response()->json(['hasShippingAddress' => $hasCompleteAddress]);
    })->name('user.has.shipping.address');
});

/*
|--------------------------------------------------------------------------
| Addresses (Public or Auth)
|--------------------------------------------------------------------------
*/
Route::get('/user/addresses', [AddressController::class, 'index'])->name('user.addresses.index');
Route::post('/user/addresses', [AddressController::class, 'store'])->name('user.addresses.store');

/*
|--------------------------------------------------------------------------
| Shop & Item Routes
|--------------------------------------------------------------------------
*/
Route::get('/shop', [ShopController::class, 'index'])->name('shop');


Route::get('/item/{id?}', [ItemController::class, 'index'])->name('item');
Route::post('/item/{id}/update', [ItemController::class, 'update'])->name('item.update');
Route::get('/item/{id}/stock', [ItemController::class, 'getStock'])->name('item.stock');


/*
|--------------------------------------------------------------------------
| Cart Routes
|--------------------------------------------------------------------------
*/
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('cart');
    Route::get('/fetch-shipping-details', [CartController::class, 'getShippingDetails'])->name('cart.get.shipping.details');
    Route::post('/store-shipping-details', [CartController::class, 'storeShippingDetails'])->name('cart.store.shipping.details');
    Route::post('/fetch-shipping-estimate', [CartController::class, 'getShippingEstimate'])->name('cart.shipping.estimate');
    Route::post('/fetch-shipping-rates', [CartController::class, 'getShippingRates'])->name('cart.shipping.rates');
});

// Stock update route
Route::post('/item/update-stock/remove', function (Request $request) {
    $item = Item::find($request->itemId);

    if ($item && $item->stock >= $request->quantity) {
        $item->stock -= $request->quantity;
        $item->save();
        return response()->json(['success' => true, 'stock' => $item->stock]);
    }

    return response()->json(['error' => 'Not enough stock or item not found'], 400);
})->name('cart.updateStock.remove');

/*
|--------------------------------------------------------------------------
| Questions Routes
|--------------------------------------------------------------------------
*/
Route::get('/api/questions', [QuestionController::class, 'getQuestionsWithReplies']);
Route::middleware('auth')->group(function () {
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::post('/questions/{question}/update', [QuestionController::class, 'update']);
});
Route::post('/questions/{id}/reply', [QuestionController::class, 'storeReply']);
Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| Reviews Routes
|--------------------------------------------------------------------------
*/
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
Route::post('/reviews/{review}/vote', [ReviewController::class, 'vote']);

Route::middleware('auth')->group(function () {
    Route::get('/reviews/create', [ReviewController::class, 'create'])->name('reviews.create');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/reviews/{review}/edit', [ReviewController::class, 'edit'])->name('reviews.edit');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::post('/reviews/{review}/reply', [ReviewController::class, 'reply'])->name('reviews.reply');
});
/*
|--------------------------------------------------------------------------
| Checkout & Payment Routes
|--------------------------------------------------------------------------
*/
Route::post('/checkout', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');

Route::prefix('payment')->name('payment.')->controller(PaymentController::class)->group(function () {
    Route::get('/details', 'get')->name('get');
    Route::post('/store', 'store')->name('store');
});
Route::post('/payment/intent', [PaymentController::class, 'createPaymentIntent'])->name('payment.intent');

/*
|--------------------------------------------------------------------------
| Orders Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::delete('/orders/{id}', [OrderController::class, 'destroy'])->name('orders.destroy');

    Route::get('/orders/{order}/return', [OrderController::class, 'returnInstructions'])->name('orders.return');
    Route::post('/orders/{order}/return/fetch-return-options', [OrderController::class, 'fetchReturnOptions'])->name('orders.return.options');
    Route::post('/orders/{order}/return/create-payment-intent', [OrderController::class, 'getPaymentIntent'])->name('orders.return.payment-intent');
    Route::post('/orders/{order}/return/finish', [OrderController::class, 'finishReturn']);
    Route::get('/orders/{order}/is-returnable', [OrderController::class, 'isReturnable']);

    Route::get('/orders-test', fn () => 'working');
});

/*
|--------------------------------------------------------------------------
| Orders Routes (Admin Only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/orders/{order}/toggle-completed', [OrderController::class, 'toggleCompleted']);
});

/*
|--------------------------------------------------------------------------
| Public Orders Routes
|--------------------------------------------------------------------------
*/
Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
Route::get('/orders/track/{carrier}/{tracking_id}', [ShippingController::class, 'trackShipment']);

/*
|--------------------------------------------------------------------------
| Returns Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/returns', [ReturnController::class, 'index'])->name('returns.index');
    Route::get('/returns/{id}', [ReturnController::class, 'show'])->name('returns.show');
    Route::post('/returns', [ReturnController::class, 'store'])->name('returns.store');
    Route::put('/returns/{id}', [ReturnController::class, 'update'])->name('returns.update');
    Route::get('/returns/{id}/details', [ReturnController::class, 'details'])->name('returns.details');
});

/*
|--------------------------------------------------------------------------
| Promo Code Routes
|--------------------------------------------------------------------------
*/
Route::post('/promo-code/validate', [PromoCodeController::class, 'validatePromoCode'])->name('promo.validate');

/*
|--------------------------------------------------------------------------
| Shipping Routes
|--------------------------------------------------------------------------
*/
Route::prefix('shipping')->group(function () {
    Route::get('/rates/{orderId}', [ShippingController::class, 'getRates']);
    Route::post('/purchase', [ShippingController::class, 'purchaseLabel']);
    Route::get('/track/{carrier}/{trackingNumber}', [ShippingController::class, 'trackShipment']);
    Route::post('/validate-address', [ShippingController::class, 'validateAddress'])->name('shipping.validate.address');
    Route::post('/return-{orderId}-options', [ShippingController::class, 'getReturnOptions'])->name('shipping.return.options');
});

/*
|--------------------------------------------------------------------------
| About / Legal / Help / Info Pages
|--------------------------------------------------------------------------
*/
Route::prefix('about')->name('about.')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('index');

    Route::prefix('legal')->name('legal.')->group(function () {
        Route::get('/', [AboutController::class, 'showLegalIndex'])->name('index');
        Route::get('use-policy', [AboutController::class, 'showUsePolicy'])->name('use-policy');
        Route::get('law-policy', [AboutController::class, 'showLawPolicy'])->name('law-policy');
        Route::get('cookie-policy', [AboutController::class, 'showCookiePolicy'])->name('cookie-policy');
        Route::get('privacy-policy', [AboutController::class, 'showPrivacyPolicy'])->name('privacy-policy');
    });

    Route::prefix('help')->name('help.')->group(function () {
        Route::get('/', [AboutController::class, 'showHelpIndex'])->name('index');
        Route::get('contact-us', [AboutController::class, 'showContactUs'])->name('contact-us');
        Route::get('about-us', [AboutController::class, 'showAboutUs'])->name('about-us');
        Route::get('faq', [AboutController::class, 'showFAQ'])->name('faq');
        Route::get('guides', [AboutController::class, 'showGuides'])->name('guides');
    });

    Route::prefix('information')->name('information.')->group(function () {
        Route::get('/', [AboutController::class, 'showInformationIndex'])->name('index');
        Route::get('payment-policy', [AboutController::class, 'showPaymentPolicy'])->name('payment-policy');
        Route::get('shipping-and-dispatchment', [AboutController::class, 'showShippingDispatchment'])->name('shipping-and-dispatchment');
        Route::get('cancellations', [AboutController::class, 'showCancellations'])->name('cancellations');
        Route::get('refunds-and-returns', [AboutController::class, 'showRefundReturn'])->name('refunds-and-returns');
    });
});

/*
|--------------------------------------------------------------------------
| Email Testing & Transactional Routes
|--------------------------------------------------------------------------
*/
Route::post('/send-email', [EmailController::class, 'send']);
Route::get('/send-order-email', [EmailController::class, 'sendOrderEmail']);

Route::get('/test-email', function () {
    Mail::html(file_get_contents(resource_path('views/emails/transactional.html')), function ($message) {
        $message->to('taylorthreader@gmail.com')->subject('Welcome!');
    });
    return 'Test email sent!';
});

Route::get('/welcome', function () {
    return view('emails.transactional');
})->name('welcome');

/*
|--------------------------------------------------------------------------
| Customer Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->get('/customers/{id}', [CustomerController::class, 'show']);
