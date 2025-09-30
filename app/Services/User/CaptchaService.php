<?php

namespace App\Services\User;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CaptchaService
{
    protected string $secret;

    public function __construct()
    {
        $this->secret = env('VITE_NOCAPTCHA_SECRET');
    }

    /**
     * Verify a Google reCAPTCHA token and return the full response
     */
    public function verify(?string $token): array
    {
        if (!$token) {
            return ['success' => false];
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $this->secret,
            'response' => $token,
        ]);

        $result = $response->json();

        if (!$result['success'] || ($result['score'] ?? 0) < 0.5) {
            Log::warning("CAPTCHA failed", $result);
        }

        return $result;
    }

    /**
     * Check if token is valid according to score threshold
     */
    public function isValid(?string $token, float $threshold = 0.5): bool
    {
        $result = $this->verify($token);
        return $result['success'] && ($result['score'] ?? 0) >= $threshold;
    }
}
