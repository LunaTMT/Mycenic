<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\{Item, Order, User};

// Controllers grouped by folders
use App\Http\Controllers\About\AboutController;
use App\Http\Controllers\Auth\{AuthenticatedSessionController, SocialAuthController};
use App\Http\Controllers\Cart\{CartController, CheckoutController, PromoCodeController};
use App\Http\Controllers\Email\EmailController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ShippingDetailController;
use App\Http\Controllers\Shop\ShopController;
use App\Http\Controllers\Shop\Item\{ItemController, QuestionController, ReviewController};
use App\Http\Controllers\User\{OrderController, ProfileController, ReturnController};
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Auth\GoogleController; // remove if unused

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
Route::middleware('auth')->prefix('profile')->group(function () {
    Route::get('/', [ProfileController::class, 'index'])->name('profile.index');
    Route::patch('/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/avatar', [ProfileController::class, 'update'])->name('profile.avatar');
    Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->prefix('user')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('profile.index');
});

Route::middleware(['auth', 'admin'])->get('/admin/all-users', [ProfileController::class, 'searchUsers'])->name('admin.all-users.search');

Route::middleware('auth')->group(function () {
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
| Shipping Details (Authenticated)
|--------------------------------------------------------------------------
*/
Route::prefix('profile/shipping-details')->middleware('auth')->group(function () {
    Route::get('/', [ShippingDetailController::class, 'index']);
    Route::post('/', [ShippingDetailController::class, 'store']);
    Route::put('/{shippingDetail}', [ShippingDetailController::class, 'update']);
    Route::put('/{shippingDetail}/default', [ShippingDetailController::class, 'setDefault']);
    Route::delete('/{shippingDetail}', [ShippingDetailController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Shop & Item Routes
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Shop & Item Routes (Resource)
|--------------------------------------------------------------------------
*/

Route::get('/shop', [ShopController::class, 'index'])->name('shop');

Route::prefix('items')->name('items.')->group(function () {
    Route::get('/', [ItemController::class, 'index'])->name('index');
    Route::get('/create', [ItemController::class, 'create'])->name('create');
    Route::post('/', [ItemController::class, 'store'])->name('store');
    Route::get('/{item}', [ItemController::class, 'show'])->name('show');
    Route::get('/{item}/edit', [ItemController::class, 'edit'])->name('edit');
    Route::put('/{item}', [ItemController::class, 'update'])->name('update');
    Route::delete('/{item}', [ItemController::class, 'destroy'])->name('destroy');
});

/*
|--------------------------------------------------------------------------
| Cart Routes
|--------------------------------------------------------------------------
*/

Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'show']);              // GET /cart - anyone
    Route::post('/items', [CartController::class, 'store']);      // POST /cart/items - anyone
    Route::get('/items/{itemId}', [CartController::class, 'showItem']); // GET /cart/items/{itemId} - anyone
    Route::put('/items/{itemId}', [CartController::class, 'update']);   // PUT /cart/items/{itemId} - anyone
    Route::delete('/items/{itemId}', [CartController::class, 'destroy']); // DELETE /cart/items/{itemId} - anyone
    Route::delete('/', [CartController::class, 'clear']);         // DELETE /cart - anyone
});
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
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');

Route::middleware('auth')->group(function () {
    Route::post('/payment/get', [PaymentController::class, 'get'])->name('payment.get');
    Route::post('/payment/store', [PaymentController::class, 'store'])->name('payment.store');
});
Route::post('/payment/create-intent', [PaymentController::class, 'createPaymentIntent'])->name('payment.create');

/*
|--------------------------------------------------------------------------
| Orders Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::delete('/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
});

/*
|--------------------------------------------------------------------------
| Returns Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
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



/*
|--------------------------------------------------------------------------
| Guest Register / View Order
|--------------------------------------------------------------------------
|
| This route allows a guest with an order to go to the register page
| and sets a flash message that can be accessed via usePage().props.flash
|
*/
Route::get('/guest/register-or-login/{order_id}/{email}', function ($order_id, $email) {
    Log::info('Guest redirected to register with order', [
        'order_id' => $order_id,
        'email' => $email,
    ]);

    return redirect()->route('register', [
        'order_id' => $order_id,
        'email' => $email,
    ])->with('flash.success', 'Registering with your email will allow you to track your order and view its details anytime.');
})->name('guest.register-or-login');