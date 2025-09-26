<?php

namespace Database\Factories;

use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition()
    {
        $categories = [
            "Agar", "Apparel", "Books", "Equipment", "Foraging", "Gourmet",
            "Grow Kits", "Infused", "Microscopy", "Spawn", "Spores"
        ];

        $category = $this->faker->randomElement($categories);

        return [
            'name' => strtoupper($this->faker->unique()->words(rand(2, 4), true)),
            'description' => $this->faker->paragraphs(rand(2, 4), true),
            'price' => $this->faker->randomFloat(2, 5, 100),
            'stock' => $this->faker->numberBetween(0, 200),
            'category' => $category,
            'weight' => $this->faker->randomFloat(2, 0.1, 5.0),
            'isPsyilocybinSpores' => $this->faker->boolean(15),
            'options' => $this->generateOptions($category),
            'stripe_product_id' => null,
            'stripe_price_id' => null,
        ];
    }

    private function generateOptions(string $category): array
    {
        return match ($category) {
            'Apparel' => [
                'Size' => ['S', 'M', 'L', 'XL'],
                'Color' => ['Black', 'White', 'Brown'],
            ],
            'Books' => [
                'Format' => ['Paperback', 'Hardcover', 'Digital'],
            ],
            'Gourmet', 'Infused' => [
                'Weight' => ['50g', '100g', '250g'],
                'Flavor' => ['Natural', 'Garlic', 'Spicy'],
            ],
            'Grow Kits' => [
                'Species' => ['Golden Teacher', 'B+', 'Penis Envy'],
                'Size' => ['Small', 'Medium', 'Large'],
            ],
            'Spores', 'Spawn' => [
                'Strain' => ['Golden Teacher', 'PE', 'Mazatapec'],
                'Syringe Volume' => ['10ml', '20ml'],
            ],
            default => [], // no default options
        };
    }
}
