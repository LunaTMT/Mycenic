<?php

namespace Database\Factories;

use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Services\UnsplashService;

class ImageFactory extends Factory
{
    protected $model = Image::class;

    public function definition(): array
    {
        $unsplashService = new UnsplashService();

        return [
            'path' => $unsplashService->getRandomMushroomImage()
                ?? 'https://source.unsplash.com/random/640x480/?mushroom,fungi',
        ];
    }
}
