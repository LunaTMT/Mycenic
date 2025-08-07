<?php

namespace App\Http\Controllers\About;

use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class AboutController extends Controller
{
    /**
     * GET /about
     */
    public function index()
    {
        return Inertia::render('About/About');
    }

    // ─── Legal Section ───────────────────────────────────────────────────────

    /**
     * GET /about/legal
     */
    public function showLegalIndex()
    {
        return Inertia::render('About/Section/Legal/Index');
    }

    /**
     * GET /about/Section/Legal/use-policy
     */
    public function showUsePolicy()
    {
        return Inertia::render('About/Section/Legal/UsePolicy');
    }

    /**
     * GET /about/Section/Legal/law-policy
     */
    public function showLawPolicy()
    {
        return Inertia::render('About/Section/Legal/LawPolicy');
    }

    /**
     * GET /about/Section/Legal/cookie-policy
     */
    public function showCookiePolicy()
    {
        return Inertia::render('About/Section/Legal/CookiePolicy');
    }

    /**
     * GET /about/Section/Legal/privacy-policy
     */
    public function showPrivacyPolicy()
    {
        return Inertia::render('About/Section/Legal/PrivacyPolicy');
    }

    // ─── Help Section ────────────────────────────────────────────────────────

    /**
     * GET /about/help
     */
    public function showHelpIndex()
    {
        return Inertia::render('About/Section/Help/Index');
    }

    /**
     * GET /about/Section/Help/contact-us
     */
    public function showContactUs()
    {
        return Inertia::render('About/Section/Help/ContactUs');
    }

    /**
     * GET /about/Section/Help/about-us
     */
    public function showAboutUs()
    {
        return Inertia::render('About/Section/Help/AboutUs');
    }

    /**
     * GET /about/Section/Help/faq
     */
    public function showFAQ()
    {
        return Inertia::render('About/Section/Help/FAQ');
    }

    /**
     * GET /about/Section/Help/guides
     */
    public function showGuides()
    {
        return Inertia::render('About/Section/Help/Guides');
    }

    // ─── Information Section ────────────────────────────────────────────────

    /**
     * GET /about/information
     */
    public function showInformationIndex()
    {
        return Inertia::render('About/Information/Index');
    }

    /**
     * GET /about/information/payment-policy
     */
    public function showPaymentPolicy()
    {
        Log::info('Payment page requested.');
        return Inertia::render('About/Information/PaymentPolicy');
    }

    /**
     * GET /about/information/shipping-and-dispatchment
     */
    public function showShippingDispatchment()
    {
        Log::info('Shipping & Dispatch page requested.');
        return Inertia::render('About/Information/ShippingDispatch');
    }

    /**
     * GET /about/information/cancellations
     */
    public function showCancellations()
    {
        Log::info('Cancellations page requested.');
        return Inertia::render('About/Information/Cancellations');
    }

    /**
     * GET /about/information/refunds-and-returns
     */
    public function showRefundReturn()
    {
        Log::info('Refunds & Returns page requested.');
        return Inertia::render('About/Information/RefundReturn');
    }
}
