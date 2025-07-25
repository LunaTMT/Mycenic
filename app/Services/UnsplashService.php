<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UnsplashService
{
    protected string $baseUrl = 'https://api.unsplash.com';

    /**
     * Get a popular mushroom image URL, weighted by popularity.
     */
    public function getRandomMushroomImage(): ?string
    {
        Log::info('UnsplashService: Fetching popular mushroom images.');

        $response = Http::get("{$this->baseUrl}/search/photos", [
            'client_id' => config('services.unsplash.access_key'),
            'query'     => 'beautiful clear mushroom',
            'order_by'  => 'popular',  // Sort by popularity
            'per_page'  => 30,         // Number of photos to get
            'orientation' => 'squarish',
        ]);

        if (!$response->successful()) {
            Log::error('UnsplashService: Failed to fetch popular mushroom images.', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;
        }

        $photos = $response->json()['results'] ?? [];

        if (empty($photos)) {
            Log::warning('UnsplashService: No popular mushroom photos found.');
            return null;
        }

        // Option 1: Simple random pick among top popular photos
        $chosenPhoto = $photos[array_rand($photos)];

        // Option 2: Weighted by likes or downloads (if you want, can add more complex weighting here)
        // For now, pick randomly for simplicity

        $url = $chosenPhoto['urls']['regular'] ?? null;
        Log::info('UnsplashService: Selected popular mushroom image.', ['url' => $url]);

        return $url;
    }

    public function getImages(string $query, int $count = 8): array
    {
        Log::info("UnsplashService: Fetching {$count} images for query '{$query}'");

        $response = Http::get("{$this->baseUrl}/search/photos", [
            'client_id' => config('services.unsplash.access_key'),
            'query' => $query,
            'per_page' => $count,
            'orientation' => 'squarish',
            'order_by' => 'relevant',
        ]);

        if (!$response->successful()) {
            Log::error('UnsplashService: Failed to fetch images from Unsplash.', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $results = $response->json()['results'] ?? [];

        $images = collect($results)
            ->pluck('urls.regular')
            ->filter()
            ->values()
            ->all();

        Log::info("UnsplashService: Successfully retrieved " . count($images) . " image(s) for '{$query}'");

        // Optionally log the image URLs for debugging (comment out in production)
        Log::debug("UnsplashService: Image URLs for '{$query}'", $images);

        return $images;
    }

    public function getRandomImages(string $query, int $count = 1): array
    {
        Log::info("UnsplashService: Getting {$count} random image(s) for query '{$query}'");

        $response = Http::get("{$this->baseUrl}/photos/random", [
            'client_id' => config('services.unsplash.access_key'),
            'query' => $query,
            'count' => $count,
            'orientation' => 'squarish',
        ]);

        if (!$response->successful()) {
            Log::error("UnsplashService: Failed to fetch random images.", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $results = $response->json();

        // If only one image is returned, wrap it in an array
        if (isset($results['urls'])) {
            $results = [$results];
        }

        return collect($results)
            ->pluck('urls.regular')
            ->filter()
            ->values()
            ->all();
    }



}
