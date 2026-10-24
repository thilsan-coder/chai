<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\ProductRecipe;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Suppliers
        $suppliers = [
            'kotmale' => Supplier::updateOrCreate(
                ['phone' => '077 234 5678'],
                [
                    'name' => 'Kotmale Dairy Lanka',
                    'contact_person' => 'Sunil Perera',
                    'phone' => '077 234 5678',
                    'email' => 'orders@kotmaledairy.lk',
                    'address' => 'Colombo Milk Distribution Center, Colombo 05',
                    'supplied_categories' => 'Fresh Cow Milk, Curd, Butter',
                    'notes' => 'Daily fresh milk delivery at 2:30 PM before shift opening.',
                    'is_active' => true,
                ]
            ),
            'tea' => Supplier::updateOrCreate(
                ['phone' => '071 889 1234'],
                [
                    'name' => 'Ceylon Pure Tea Supplies',
                    'contact_person' => 'Mohamed Riaz',
                    'phone' => '071 889 1234',
                    'email' => 'riaz@ceylonteasupplies.com',
                    'address' => 'Main Street, Pettah, Colombo 11',
                    'supplied_categories' => 'BOPF Tea Dust, Pekoe, Green Tea',
                    'notes' => 'High quality strong tea dust for authentic Sri Lankan Chai.',
                    'is_active' => true,
                ]
            ),
            'spices' => Supplier::updateOrCreate(
                ['phone' => '076 543 2190'],
                [
                    'name' => 'Matale Organic Spices',
                    'contact_person' => 'K. Bandara',
                    'phone' => '076 543 2190',
                    'email' => 'sales@matalespices.lk',
                    'address' => 'Old Moor Street, Colombo 12',
                    'supplied_categories' => 'Cardamom (ஏலக்காய்), Ginger, Cinnamon, Cloves',
                    'notes' => 'A-grade Ceylon green cardamom & freshly dried ginger.',
                    'is_active' => true,
                ]
            ),
            'bakery' => Supplier::updateOrCreate(
                ['phone' => '075 998 8776'],
                [
                    'name' => 'Sunrise Golden Bakery',
                    'contact_person' => 'Nimal Silva',
                    'phone' => '075 998 8776',
                    'email' => 'sunrisebakers@gmail.com',
                    'address' => 'Galle Road, Dehiwala',
                    'supplied_categories' => 'Burger Buns, Submarine Rolls, Toast Bread',
                    'notes' => 'Delivers fresh baked buns daily at 3:00 PM.',
                    'is_active' => true,
                ]
            ),
            'packaging' => Supplier::updateOrCreate(
                ['phone' => '077 112 3344'],
                [
                    'name' => 'Metro Eco Packaging & Clay Pots',
                    'contact_person' => 'S. Tharmalingam',
                    'phone' => '077 112 3344',
                    'email' => 'metroeco@sltnet.lk',
                    'address' => 'Negombo Road, Wattala',
                    'supplied_categories' => 'Clay Pots, Paper Cups, Kraft Takeaway Boxes',
                    'notes' => 'Handmade traditional clay pots (மண் குவளை) for signature chai.',
                    'is_active' => true,
                ]
            ),
        ];

        // 2. Create Raw Inventory Items
        $itemsData = [
            [
                'name' => 'Fresh Cow Milk (Liquid)',
                'code' => 'RAW-MILK',
                'category' => 'dairy',
                'unit' => 'l',
                'current_stock' => 45.000,
                'min_stock_alert' => 15.000,
                'cost_per_unit' => 280.00, // Rs. 280 / Liter
                'supplier_id' => $suppliers['kotmale']->id,
            ],
            [
                'name' => 'BOPF Special Chai Tea Dust',
                'code' => 'RAW-TEA-DUST',
                'category' => 'tea_spices',
                'unit' => 'kg',
                'current_stock' => 18.500,
                'min_stock_alert' => 5.000,
                'cost_per_unit' => 1850.00, // Rs. 1,850 / kg
                'supplier_id' => $suppliers['tea']->id,
            ],
            [
                'name' => 'Ceylon Green Cardamom (ஏலக்காய்)',
                'code' => 'RAW-CARDAMOM',
                'category' => 'tea_spices',
                'unit' => 'kg',
                'current_stock' => 3.200,
                'min_stock_alert' => 1.000,
                'cost_per_unit' => 12500.00, // Rs. 12,500 / kg
                'supplier_id' => $suppliers['spices']->id,
            ],
            [
                'name' => 'Fresh Ginger Root (இஞ்சி)',
                'code' => 'RAW-GINGER',
                'category' => 'tea_spices',
                'unit' => 'kg',
                'current_stock' => 8.000,
                'min_stock_alert' => 3.000,
                'cost_per_unit' => 950.00, // Rs. 950 / kg
                'supplier_id' => $suppliers['spices']->id,
            ],
            [
                'name' => 'Pure White Cane Sugar',
                'code' => 'RAW-SUGAR',
                'category' => 'tea_spices',
                'unit' => 'kg',
                'current_stock' => 50.000,
                'min_stock_alert' => 15.000,
                'cost_per_unit' => 260.00, // Rs. 260 / kg
                'supplier_id' => $suppliers['spices']->id,
            ],
            [
                'name' => 'Traditional Clay Pots (மண் குவளை)',
                'code' => 'RAW-CLAY-POT',
                'category' => 'packaging',
                'unit' => 'pcs',
                'current_stock' => 180.000,
                'min_stock_alert' => 50.000,
                'cost_per_unit' => 35.00, // Rs. 35 / pot
                'supplier_id' => $suppliers['packaging']->id,
            ],
            [
                'name' => 'Insulated Paper Chai Cups (200ml)',
                'code' => 'RAW-PAPER-CUP',
                'category' => 'packaging',
                'unit' => 'pcs',
                'current_stock' => 850.000,
                'min_stock_alert' => 200.000,
                'cost_per_unit' => 12.00, // Rs. 12 / cup
                'supplier_id' => $suppliers['packaging']->id,
            ],
            [
                'name' => 'Sesame Brioche Burger Buns',
                'code' => 'RAW-BUN-BURGER',
                'category' => 'bakery_meats',
                'unit' => 'pcs',
                'current_stock' => 45.000,
                'min_stock_alert' => 15.000,
                'cost_per_unit' => 85.00, // Rs. 85 / bun
                'supplier_id' => $suppliers['bakery']->id,
            ],
            [
                'name' => 'Marinated Crispy Chicken Breast Patty',
                'code' => 'RAW-CHICKEN-PATTY',
                'category' => 'bakery_meats',
                'unit' => 'pcs',
                'current_stock' => 32.000,
                'min_stock_alert' => 10.000,
                'cost_per_unit' => 340.00, // Rs. 340 / patty
                'supplier_id' => $suppliers['bakery']->id,
            ],
            [
                'name' => 'Submarine Bread Loaves (8-inch)',
                'code' => 'RAW-BREAD-SUB',
                'category' => 'bakery_meats',
                'unit' => 'pcs',
                'current_stock' => 25.000,
                'min_stock_alert' => 10.000,
                'cost_per_unit' => 120.00, // Rs. 120 / sub loaf
                'supplier_id' => $suppliers['bakery']->id,
            ],
            [
                'name' => 'Frozen Straight-Cut Fries (10mm)',
                'code' => 'RAW-FRIES',
                'category' => 'bakery_meats',
                'unit' => 'kg',
                'current_stock' => 12.000,
                'min_stock_alert' => 5.000,
                'cost_per_unit' => 850.00, // Rs. 850 / kg
                'supplier_id' => $suppliers['bakery']->id,
            ],
            [
                'name' => 'Blue Curacao Syrup (750ml)',
                'code' => 'RAW-SYRUP-CURACAO',
                'category' => 'syrups_extras',
                'unit' => 'bottle',
                'current_stock' => 4.000,
                'min_stock_alert' => 2.000,
                'cost_per_unit' => 2800.00, // Rs. 2,800 / bottle
                'supplier_id' => $suppliers['spices']->id,
            ],
            [
                'name' => 'Fresh Garden Mint Leaves',
                'code' => 'RAW-MINT',
                'category' => 'tea_spices',
                'unit' => 'kg',
                'current_stock' => 1.500,
                'min_stock_alert' => 0.500,
                'cost_per_unit' => 1200.00,
                'supplier_id' => $suppliers['spices']->id,
            ],
            [
                'name' => 'Vegetable Frying Oil',
                'code' => 'RAW-OIL',
                'category' => 'bakery_meats',
                'unit' => 'l',
                'current_stock' => 25.000,
                'min_stock_alert' => 8.000,
                'cost_per_unit' => 620.00,
                'supplier_id' => $suppliers['spices']->id,
            ],
        ];

        $createdInventory = [];
        foreach ($itemsData as $data) {
            $createdInventory[$data['code']] = InventoryItem::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }

        // 3. Link Recipes (BOM) to Menu Products
        $masalaChai = Product::where('slug', 'special-masala-chai')->first();
        if ($masalaChai && isset($createdInventory['RAW-MILK'])) {
            // Recipe for 1 cup Masala Chai
            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $masalaChai->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-MILK']->id,
                ],
                ['quantity_required' => 0.150] // 150ml milk
            );

            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $masalaChai->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-TEA-DUST']->id,
                ],
                ['quantity_required' => 0.012] // 12g tea
            );

            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $masalaChai->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-CARDAMOM']->id,
                ],
                ['quantity_required' => 0.002] // 2g cardamom
            );

            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $masalaChai->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-SUGAR']->id,
                ],
                ['quantity_required' => 0.010] // 10g sugar
            );

            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $masalaChai->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-PAPER-CUP']->id,
                ],
                ['quantity_required' => 1.000] // 1 cup
            );
        }

        $burger = Product::where('slug', 'crispy-chicken-burger')->first();
        if ($burger && isset($createdInventory['RAW-BUN-BURGER'])) {
            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $burger->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-BUN-BURGER']->id,
                ],
                ['quantity_required' => 1.000]
            );

            ProductRecipe::updateOrCreate(
                [
                    'product_id' => $burger->id,
                    'variant_id' => null,
                    'inventory_item_id' => $createdInventory['RAW-CHICKEN-PATTY']->id,
                ],
                ['quantity_required' => 1.000]
            );
        }
    }
}
