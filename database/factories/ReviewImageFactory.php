<?php

namespace Database\Factories;

use App\Models\ReviewImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Services\UnsplashService;

class ReviewImageFactory extends Factory
{
    protected $model = ReviewImage::class;

    public function definition()
    {
        $unsplashService = new UnsplashService();

        return [
            'review_id' => null, // to be set explicitly in seeder or caller
            'image_path' => $unsplashService->getRandomMushroomImage() 
                ?? 'https://source.unsplash.com/random/640x480/?mushroom,fungi', // fallback
        ];
    }
}
