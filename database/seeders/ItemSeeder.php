<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use Stripe\Stripe;
use Stripe\Product;
use Stripe\Price;
use Illuminate\Support\Facades\Log;

class ItemSeeder extends Seeder
{
    public function run()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $items = [
            [
                'name' => 'Sterile Organic Rye Grain',
                'description' => "High-quality sterile organic rye grain, perfect for mushroom spawn production. \n\n This grain is pressure-sterilized to eliminate contaminants and packaged in sealed, filtered bags to maintain sterility.\n\nIt offers ideal moisture content and particle size for rapid mycelial colonization, making it an excellent choice for both beginners and professional cultivators seeking dependable, high-yield results.",
                'price' => 10,
                'stock' => 0,
                'images' => ['assets/images/products/1/0.png', 'assets/images/products/2/0.png', 'assets/images/products/3/0.png', 'assets/images/products/4/0.png'],
                'category' => 'spawn',
                'weight' => 1.0,
            ],
            [
                'name' => 'Reishi Mushroom Supplements',
                'description' => "Premium Reishi mushroom supplement designed to support immunity and overall wellness. Each capsule contains highly concentrated Reishi extract, known for its adaptogenic and antioxidant properties.\n\nThese supplements are ideal for daily use to reduce stress, enhance liver function, and boost natural immune defenses. Sustainably grown and lab-tested, this product ensures potency and purity with every dose.",
                'price' => round(49.99),
                'stock' => 20,
                'images' => ['assets/images/products/2/0.png', 'assets/images/products/2/0.png', 'assets/images/products/2/0.png', 'assets/images/products/2/0.png'],
                'category' => 'infused',
                'weight' => 0.3,
            ],
            [
                'name' => 'Sterile Agar Plates',
                'description' => "Pre-poured sterile agar plates for isolating strains, testing spores, and expanding mycelium cultures in a lab-grade environment. Made with nutrient-rich media and poured in sterile conditions, these plates are perfect for precision work in amateur or professional mycology.\n\nThey arrive ready to use and are sealed to prevent contamination during shipping and storage, ensuring reliable experimental results.",
                'price' => 30,
                'stock' => 100,
                'images' => ['assets/images/products/3/0.png', 'assets/images/products/3/0.png', 'assets/images/products/3/0.png', 'assets/images/products/3/0.png'],
                'category' => 'grow kits',
                'weight' => 0.6,
            ],
            [
                'name' => 'Mycelium Infused Coffee - Dark Roast',
                'description' => "Rich and aromatic coffee blend infused with functional mushroom extracts for enhanced focus and well-being. Combining bold, slow-roasted coffee beans with scientifically studied mushroom strains, this beverage offers a unique synergy of flavor and function.\n\nIt’s designed to elevate cognitive performance, reduce fatigue, and provide a jitter-free energy boost that fits perfectly into morning or afternoon routines.",
                'price' => 69,
                'stock' => 100,
                'images' => ['assets/images/products/4/0.png', 'assets/images/products/4/0.png', 'assets/images/products/4/0.png', 'assets/images/products/4/0.png'],
                'category' => 'foraging',
                'weight' => 0.5,
            ],
            [
                'name' => 'Sterile Organic Rye Grain - 2kg',
                'description' => "Larger pack of sterile organic rye grain for extended mushroom spawn projects and bulk cultivation. Ideal for commercial setups or enthusiasts scaling up production, this grain undergoes the same stringent sterilization process as our 1kg option.\n\nThe increased volume offers better value and less packaging waste, making it a smart choice for ongoing or large-scale cultivation needs.",
                'price' => 18,
                'stock' => 50,
                'images' => ['assets/images/products/1/0.png', 'assets/images/products/1/0.png', 'assets/images/products/1/0.png', 'assets/images/products/1/0.png'],
                'category' => 'spawn',
                'weight' => 2.0,
            ],
            [
                'name' => 'Reishi Tincture - Dual Extract 50ml',
                'description' => "Potent Reishi mushroom tincture, extracted using dual-extraction methods for maximum bioavailability and benefits. This formulation combines hot water and alcohol extractions to capture both polysaccharides and triterpenes, key compounds that promote immune regulation and stress resistance.\n\nEach drop delivers a concentrated dose of wellness and can be added to drinks, food, or taken directly.",
                'price' => round(39.99),
                'stock' => 30,
                'images' => ['assets/images/products/2/0.png', 'assets/images/products/2/0.png', 'assets/images/products/2/0.png', 'assets/images/products/2/0.png'],
                'category' => 'infused',
                'weight' => 0.15,
            ],
            [
                'name' => 'Petri Dishes with Agar',
                'description' => "Lab-grade sterile petri dishes pre-filled with nutrient-rich agar for precise mycology experiments. These dishes are vacuum-sealed for long-term storage and consistency in laboratory or fieldwork environments.\n\nIdeal for spore germination, tissue culture, or contamination testing, they offer crystal-clear agar, consistent pour depth, and smooth surfaces for optimal visibility and manipulation under a microscope.",
                'price' => 50,
                'stock' => 200,
                'images' => ['assets/images/products/1/0.png', 'assets/images/products/3/0.png', 'assets/images/products/3/0.png', 'assets/images/products/3/0.png'],
                'category' => 'grow kits',
                'weight' => 0.4,
            ],
            [
                'name' => 'Lion’s Mane Mushroom Coffee',
                'description' => "A smooth, medium roast coffee infused with Lion’s Mane mushroom extract for cognitive support and mental clarity. Each cup is crafted to enhance brain function, memory, and focus without the typical crash of traditional coffee.\n\nLion’s Mane is well-documented for its neuroregenerative effects, and when paired with high-grade coffee beans, it creates a delicious, brain-boosting brew perfect for any time of day.",
                'price' => 75,
                'stock' => 80,
                'images' => ['assets/images/products/4/0.png', 'assets/images/products/4/0.png', 'assets/images/products/4/0.png', 'assets/images/products/4/0.png'],
                'category' => 'foraging',
                'weight' => 0.5,
            ],
            [
                'name' => 'Golden Teacher Spore Syringe - 10ml',
                'description' => "A 10ml spore syringe containing Golden Teacher mushroom spores suspended in sterile solution. Ideal for microscopy and mycology research purposes. \n\nEach syringe is packaged in a sterile bag with an included sterile needle, ensuring safe and contaminant-free study. Not for cultivation where prohibited.",
                'price' => 12,
                'stock' => 100,
                'images' => ['assets/images/grid/spore_syringe.png'],
                'category' => 'spores',
                'weight' => 0.1,
                'isPsyilocybinSpores' => true
            ],
        ];

        foreach ($items as $item) {
            try {
                $item['price'] = intval(round($item['price']));
                shuffle($item['images']);

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
                    'category' => strtoupper($item['category']),
                    'stripe_product_id' => $product->id,
                    'stripe_price_id' => $price->id,
                    'weight' => $item['weight'],
                    'isPsyilocybinSpores' => $item['isPsyilocybinSpores'] ?? false
                ]);


                Log::info("Item created successfully: " . $item['name']);
            } catch (\Exception $e) {
                Log::error("Error creating item in Stripe: " . $e->getMessage());
            }
        }
    }
}
