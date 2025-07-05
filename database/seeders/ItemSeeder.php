<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use App\Services\UnsplashService;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;

class ItemSeeder extends Seeder
{
    protected UnsplashService $unsplash;

    public function __construct(UnsplashService $unsplash)
    {
        $this->unsplash = $unsplash;
    }

    public function run()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $unsplashItems = [
            [
                'name' => 'Golden Teacher Spores',
                'description' => "One of the most popular psilocybin strains.\n\nPerfect for microscopy enthusiasts.",
                'price' => 20,
                'stock' => 25,
                'category' => 'spores',
                'weight' => 0.1,
                'isPsyilocybinSpores' => true,
                'options' => [
                    'Spore Volume' => ['1ml', '3ml', '5ml'],
                    'Format' => ['Syringe', 'Swab'],
                    'Packaging' => ['Sterile', 'Non-sterile'],
                ],
            ],
        ];

        $manualItems = [
            [
                'name' => 'Sterile Organic Rye Grain',
                'description' => "High-quality sterile organic rye grain, perfect for mushroom spawn production. \n\n This grain is pressure-sterilized to eliminate contaminants and packaged in sealed, filtered bags to maintain sterility.\n\nIt offers ideal moisture content and particle size for rapid mycelial colonization, making it an excellent choice for both beginners and professional cultivators seeking dependable, high-yield results.",
                'price' => 10,
                'stock' => 0,
                'images' => ['assets/images/products/1/0.png', 'assets/images/products/2/0.png', 'assets/images/products/3/0.png', 'assets/images/products/4/0.png'],
                'category' => 'spawn',
                'weight' => 1.0,
                'options' => [
                    'Pack Size' => ['500g', '1kg', '2kg'],
                    'Packaging' => ['Bag', 'Box'],
                ],
            ],
            [
                'name' => 'Reishi Mushroom Supplements',
                'description' => "Premium Reishi mushroom supplement designed to support immunity and overall wellness. Each capsule contains highly concentrated Reishi extract, known for its adaptogenic and antioxidant properties.\n\nThese supplements are ideal for daily use to reduce stress, enhance liver function, and boost natural immune defenses. Sustainably grown and lab-tested, this product ensures potency and purity with every dose.",
                'price' => 50,
                'stock' => 20,
                'images' => array_fill(0, 8, 'assets/images/products/2/0.png'),
                'category' => 'infused',
                'weight' => 0.3,
                'options' => [
                    'Capsule Count' => ['30', '60', '90'],
                    'Dosage' => ['500mg', '1000mg'],
                ],
            ],
            [
                'name' => 'Sterile Agar Plates',
                'description' => "Pre-poured sterile agar plates for isolating strains, testing spores, and expanding mycelium cultures in a lab-grade environment. Made with nutrient-rich media and poured in sterile conditions, these plates are perfect for precision work in amateur or professional mycology.\n\nThey arrive ready to use and are sealed to prevent contamination during shipping and storage, ensuring reliable experimental results.",
                'price' => 30,
                'stock' => 100,
                'images' => array_fill(0, 8, 'assets/images/products/3/0.png'),
                'category' => 'grow kits',
                'weight' => 0.6,
                'options' => [
                    'Plate Count' => ['10-pack', '20-pack'],
                    'Agar Type' => ['MEA', 'PDA', 'LME'],
                ],
            ],
            [
                'name' => 'Mycelium Infused Coffee - Dark Roast',
                'description' => "Rich and aromatic coffee blend infused with functional mushroom extracts for enhanced focus and well-being. Combining bold, slow-roasted coffee beans with scientifically studied mushroom strains, this beverage offers a unique synergy of flavor and function.\n\nIt’s designed to elevate cognitive performance, reduce fatigue, and provide a jitter-free energy boost that fits perfectly into morning or afternoon routines.",
                'price' => 69,
                'stock' => 100,
                'images' => array_fill(0, 8, 'assets/images/products/4/0.png'),
                'category' => 'foraging',
                'weight' => 0.5,
                'options' => [
                    'Grind' => ['Whole Bean', 'Ground'],
                    'Size' => ['250g', '500g'],
                ],
            ],
            [
                'name' => 'Sterile Organic Rye Grain - 2kg',
                'description' => "Larger pack of sterile organic rye grain for extended mushroom spawn projects and bulk cultivation. Ideal for commercial setups or enthusiasts scaling up production, this grain undergoes the same stringent sterilization process as our 1kg option.\n\nThe increased volume offers better value and less packaging waste, making it a smart choice for ongoing or large-scale cultivation needs.",
                'price' => 18,
                'stock' => 50,
                'images' => array_fill(0, 8, 'assets/images/products/1/0.png'),
                'category' => 'spawn',
                'weight' => 2.0,
                'options' => [
                    'Packaging' => ['Bag', 'Box'],
                ],
            ],
            [
                'name' => 'Reishi Tincture - Dual Extract 50ml',
                'description' => "Potent Reishi mushroom tincture, extracted using dual-extraction methods for maximum bioavailability and benefits. This formulation combines hot water and alcohol extractions to capture both polysaccharides and triterpenes, key compounds that promote immune regulation and stress resistance.\n\nEach drop delivers a concentrated dose of wellness and can be added to drinks, food, or taken directly.",
                'price' => 40,
                'stock' => 30,
                'images' => array_fill(0, 8, 'assets/images/products/2/0.png'),
                'category' => 'infused',
                'weight' => 0.15,
                'options' => [
                    'Bottle Size' => ['30ml', '50ml'],
                    'Extraction Type' => ['Dual', 'Triple'],
                ],
            ],
            [
                'name' => 'Petri Dishes with Agar',
                'description' => "Lab-grade sterile petri dishes pre-filled with nutrient-rich agar for precise mycology experiments. These dishes are vacuum-sealed for long-term storage and consistency in laboratory or fieldwork environments.\n\nIdeal for spore germination, tissue culture, or contamination testing, they offer crystal-clear agar, consistent pour depth, and smooth surfaces for optimal visibility and manipulation under a microscope.",
                'price' => 50,
                'stock' => 200,
                'images' => [
                    'assets/images/products/1/0.png',
                    'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                           'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                           'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                    'assets/images/products/3/0.png',
                ],
                'category' => 'grow kits',
                'weight' => 0.4,
                'options' => [
                    'Plate Count' => ['10-pack', '25-pack'],
                    'Agar Type' => ['MEA', 'PDA'],
                ],
            ],
            [
                'name' => 'Lion’s Mane Mushroom Coffee',
                'description' => "A smooth, medium roast coffee infused with Lion’s Mane mushroom extract for cognitive support and mental clarity. Each cup is crafted to enhance brain function, memory, and focus without the typical crash of traditional coffee.\n\nLion’s Mane is well-documented for its neuroregenerative effects, and when paired with high-grade coffee beans, it creates a delicious, brain-boosting brew perfect for any time of day.",
                'price' => 75,
                'stock' => 80,
                'images' => array_fill(0, 8, 'assets/images/products/4/0.png'),
                'category' => 'foraging',
                'weight' => 0.5,
                'options' => [
                    'Grind' => ['Whole Bean', 'Ground'],
                    'Size' => ['250g', '1kg'],
                ],
            ],
            [
                'name' => 'Golden Teacher Spore Syringe - 10ml',
                'description' => "A 10ml spore syringe containing Golden Teacher mushroom spores suspended in sterile solution. Ideal for microscopy and mycology research purposes. \n\nEach syringe is packaged in a sterile bag with an included sterile needle, ensuring safe and contaminant-free study. Not for cultivation where prohibited.",
                'price' => 12,
                'stock' => 100,
                'images' => array_fill(0, 8, 'assets/images/grid/spore_syringe.png'),
                'category' => 'spores',
                'weight' => 0.1,
                'isPsyilocybinSpores' => true,
                'options' => [
                    'Volume' => ['10ml'],
                    'Format' => ['Syringe'],
                    'Packaging' => ['Sterile Bag'],
                ],
            ],
        ];

        // Seed Unsplash items
        foreach ($unsplashItems as $item) {
            try {
                $item['price'] = intval(round($item['price']));
                $item['images'] = $this->unsplash->getImages($item['name'], 24);
                $item['image_sources'] = array_fill(0, count($item['images']), 'unsplash');

                $product = Product::create([
                    'name' => $item['name'],
                    'description' => $item['description'],
                ]);

                $price = Price::create([
                    'unit_amount' => $item['price'] * 100,
                    'currency' => 'gbp',
                    'product' => $product->id,
                ]);

                Item::create([
                    'name' => strtoupper($item['name']),
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'images' => json_encode($item['images']),
                    'image_sources' => json_encode($item['image_sources']),
                    'category' => strtoupper($item['category']),
                    'stripe_product_id' => $product->id,
                    'stripe_price_id' => $price->id,
                    'weight' => $item['weight'],
                    'isPsyilocybinSpores' => $item['isPsyilocybinSpores'] ?? false,
                    'options' => isset($item['options']) ? json_encode($item['options']) : null,
                ]);

                Log::info("Seeded Unsplash item: {$item['name']}");
            } catch (\Exception $e) {
                Log::error("Failed to seed Unsplash item {$item['name']}: " . $e->getMessage());
            }
        }

        // Seed manual items
        foreach ($manualItems as $item) {
            try {
                $item['price'] = intval(round($item['price']));
                $item['image_sources'] = array_fill(0, count($item['images']), 'manual');

                $product = Product::create([
                    'name' => $item['name'],
                    'description' => $item['description'],
                ]);

                $price = Price::create([
                    'unit_amount' => $item['price'] * 100,
                    'currency' => 'gbp',
                    'product' => $product->id,
                ]);

                Item::create([
                    'name' => strtoupper($item['name']),
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'images' => json_encode($item['images']),
                    'image_sources' => json_encode($item['image_sources']),
                    'category' => strtoupper($item['category']),
                    'stripe_product_id' => $product->id,
                    'stripe_price_id' => $price->id,
                    'weight' => $item['weight'],
                    'isPsyilocybinSpores' => $item['isPsyilocybinSpores'] ?? false,
                    'options' => isset($item['options']) ? json_encode($item['options']) : null,
                ]);

                Log::info("Seeded manual item: {$item['name']}");
            } catch (\Exception $e) {
                Log::error("Failed to seed manual item {$item['name']}: " . $e->getMessage());
            }
        }
    }
}
