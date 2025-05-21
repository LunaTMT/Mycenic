<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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
        return Inertia::render('About/Legal/Index');
    }

    /**
     * GET /about/legal/use-policy
     */
    public function showUsePolicy()
    {
        return Inertia::render('About/Legal/UsePolicy');
    }

    /**
     * GET /about/legal/law-policy
     */
    public function showLawPolicy()
    {
        return Inertia::render('About/Legal/LawPolicy');
    }

    /**
     * GET /about/legal/cookie-policy
     */
    public function showCookiePolicy()
    {
        return Inertia::render('About/Legal/CookiePolicy');
    }

    /**
     * GET /about/legal/privacy-policy
     */
    public function showPrivacyPolicy()
    {
        return Inertia::render('About/Legal/PrivacyPolicy');
    }

    // ─── Help Section ────────────────────────────────────────────────────────

    /**
     * GET /about/help
     */
    public function showHelpIndex()
    {
        return Inertia::render('About/Help/Index');
    }

    /**
     * GET /about/help/contact-us
     */
    public function showContactUs()
    {
        return Inertia::render('About/Help/ContactUs');
    }

    /**
     * GET /about/help/about-us
     */
    public function showAboutUs()
    {
        return Inertia::render('About/Help/AboutUs');
    }

    /**
     * GET /about/help/faq
     */
    public function showFAQ()
    {
        return Inertia::render('About/Help/FAQ');
    }

    /**
     * GET /about/help/guides
     */
    public function showGuides()
    {
        return Inertia::render('About/Help/Guides');
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
