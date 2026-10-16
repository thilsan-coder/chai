<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /**
     * Seed initial Oonjal Chai cafe menu categories and products.
     */
    public function run(): void
    {
        $menuData = [
            [
                'name' => 'Chai & Hot Brews',
                'description' => 'Authentic spiced, boiled, and flavored Sri Lankan chai',
                'icon' => 'Coffee',
                'sort_order' => 1,
                'products' => [
                    [
                        'name' => 'Special Masala Chai',
                        'description' => 'House special slow-brewed milk chai with aromatic spices and clove notes',
                        'base_price' => 150.00,
                        'cost_price' => 45.00,
                        'is_featured' => true,
                        'variants' => [
                            ['name' => 'Regular Glass', 'price' => 150.00, 'is_default' => true],
                            ['name' => 'Large Clay Cup', 'price' => 220.00, 'is_default' => false],
                        ],
                        'addons' => [
                            ['name' => 'Extra Jaggery', 'price' => 30.00],
                            ['name' => 'Double Ginger Kick', 'price' => 25.00],
                        ],
                    ],
                    [
                        'name' => 'Cardamom Ginger Chai',
                        'description' => 'Fragrant green cardamom crushed with fresh ginger root',
                        'base_price' => 160.00,
                        'cost_price' => 50.00,
                        'is_featured' => false,
                        'variants' => [
                            ['name' => 'Regular Glass', 'price' => 160.00, 'is_default' => true],
                            ['name' => 'Large Clay Cup', 'price' => 230.00, 'is_default' => false],
                        ],
                    ],
                    [
                        'name' => 'Sulaimani Lemon Chai',
                        'description' => 'Traditional golden black tea brewed with crushed mint, lemon, and cardamom',
                        'base_price' => 100.00,
                        'cost_price' => 25.00,
                        'is_featured' => false,
                    ],
                ],
            ],
            [
                'name' => 'Coffee & Espresso',
                'description' => 'Rich roasts, frothy milk coffees, and cold caffeinated treats',
                'icon' => 'Coffee',
                'sort_order' => 2,
                'products' => [
                    [
                        'name' => 'Classic Milk Coffee',
                        'description' => 'Frothy South Asian style boiled milk filter coffee',
                        'base_price' => 180.00,
                        'cost_price' => 60.00,
                        'variants' => [
                            ['name' => 'Regular', 'price' => 180.00, 'is_default' => true],
                            ['name' => 'Large', 'price' => 250.00, 'is_default' => false],
                        ],
                    ],
                    [
                        'name' => 'Iced Coffee Shake',
                        'description' => 'Chilled milk coffee blended with vanilla cream and chocolate dust',
                        'base_price' => 380.00,
                        'cost_price' => 110.00,
                        'is_featured' => true,
                        'addons' => [
                            ['name' => 'Ice Cream Scoop', 'price' => 120.00],
                            ['name' => 'Extra Espresso Shot', 'price' => 100.00],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Burgers & Chicken',
                'description' => 'Crispy fried chicken, juicy patties, toasted sesame buns',
                'icon' => 'Utensils',
                'sort_order' => 3,
                'products' => [
                    [
                        'name' => 'Crispy Chicken Burger',
                        'description' => 'Fried crispy chicken thigh fillet with fresh lettuce, pickled onions, and house spicy mayo',
                        'base_price' => 750.00,
                        'cost_price' => 320.00,
                        'is_featured' => true,
                        'variants' => [
                            ['name' => 'Single Patty', 'price' => 750.00, 'is_default' => true],
                            ['name' => 'Double Patty', 'price' => 1050.00, 'is_default' => false],
                        ],
                        'addons' => [
                            ['name' => 'Cheddar Cheese Slice', 'price' => 100.00],
                            ['name' => 'Extra Spicy Mayo Dip', 'price' => 80.00],
                            ['name' => 'Fried Egg Topping', 'price' => 90.00],
                        ],
                    ],
                    [
                        'name' => 'Cheesy Beef Burger',
                        'description' => 'Spiced grilled beef patty topped with melted cheddar, caramelized onions, and BBQ drizzle',
                        'base_price' => 850.00,
                        'cost_price' => 380.00,
                        'variants' => [
                            ['name' => 'Single Patty', 'price' => 850.00, 'is_default' => true],
                            ['name' => 'Double Patty', 'price' => 1200.00, 'is_default' => false],
                        ],
                        'addons' => [
                            ['name' => 'Extra Cheese Slice', 'price' => 100.00],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Submarines & Sandwiches',
                'description' => 'Toasted Sri Lankan bakery style submarines and club sandwiches',
                'icon' => 'Layers',
                'sort_order' => 4,
                'products' => [
                    [
                        'name' => 'Chicken Submarine',
                        'description' => 'Shredded spiced chicken with stir-fried capsicum, garlic mayo, and melted cheese in a toasted baguette',
                        'base_price' => 950.00,
                        'cost_price' => 390.00,
                        'is_featured' => true,
                        'variants' => [
                            ['name' => 'Half Submarine (6-inch)', 'price' => 550.00, 'is_default' => false],
                            ['name' => 'Full Submarine (12-inch)', 'price' => 950.00, 'is_default' => true],
                        ],
                        'addons' => [
                            ['name' => 'Extra Melted Cheese', 'price' => 150.00],
                            ['name' => 'Jalapeno Peppers', 'price' => 80.00],
                        ],
                    ],
                    [
                        'name' => 'Triple Layer Club Sandwich',
                        'description' => 'Toasted sandwich layered with chicken spread, boiled egg, cheese, and crunchy cucumber',
                        'base_price' => 650.00,
                        'cost_price' => 240.00,
                    ],
                ],
            ],
            [
                'name' => 'Mojitos & Refreshers',
                'description' => 'Muddled fresh mint, lime, and crushed ice sodas',
                'icon' => 'CupSoda',
                'sort_order' => 5,
                'products' => [
                    [
                        'name' => 'Blue Curacao Mojito',
                        'description' => 'Vibrant blue citrus syrup shaken with fresh mint leaves, lime wedges, and sparkling soda',
                        'base_price' => 450.00,
                        'cost_price' => 120.00,
                        'is_featured' => true,
                        'variants' => [
                            ['name' => 'Glass (350ml)', 'price' => 450.00, 'is_default' => true],
                            ['name' => 'Pitcher (1 Litre)', 'price' => 1200.00, 'is_default' => false],
                        ],
                    ],
                    [
                        'name' => 'Green Apple Mojito',
                        'description' => 'Crisp green apple puree muddled with zesty lime, mint sprigs, and soda water',
                        'base_price' => 450.00,
                        'cost_price' => 120.00,
                    ],
                    [
                        'name' => 'Passion Fruit Sparkler',
                        'description' => 'Fresh tropical passion fruit pulp infused with chilled soda and lemon',
                        'base_price' => 420.00,
                        'cost_price' => 110.00,
                    ],
                ],
            ],
            [
                'name' => 'Brownies & Desserts',
                'description' => 'Warm bakery desserts, fudge brownies, and sweet toppings',
                'icon' => 'Cake',
                'sort_order' => 6,
                'products' => [
                    [
                        'name' => 'Fudgy Brownie with Ice Cream',
                        'description' => 'Warm dark chocolate fudge brownie served with a scoop of vanilla ice cream and chocolate sauce',
                        'base_price' => 420.00,
                        'cost_price' => 130.00,
                        'is_featured' => true,
                        'addons' => [
                            ['name' => 'Extra Vanilla Ice Cream Scoop', 'price' => 120.00],
                            ['name' => 'Roasted Cashew Sprinkles', 'price' => 70.00],
                        ],
                    ],
                    [
                        'name' => 'Choco Lava Cake',
                        'description' => 'Oven baked miniature chocolate sponge with a molten chocolate core',
                        'base_price' => 480.00,
                        'cost_price' => 160.00,
                    ],
                ],
            ],
        ];

        foreach ($menuData as $catData) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($catData['name'])],
                [
                    'name' => $catData['name'],
                    'description' => $catData['description'],
                    'icon' => $catData['icon'],
                    'sort_order' => $catData['sort_order'],
                    'is_active' => true,
                ]
            );

            foreach ($catData['products'] as $pIndex => $pData) {
                $product = Product::updateOrCreate(
                    ['slug' => Str::slug($pData['name'])],
                    [
                        'category_id' => $category->id,
                        'name' => $pData['name'],
                        'description' => $pData['description'] ?? null,
                        'base_price' => $pData['base_price'],
                        'cost_price' => $pData['cost_price'] ?? null,
                        'is_available' => true,
                        'is_featured' => $pData['is_featured'] ?? false,
                        'sort_order' => $pIndex + 1,
                    ]
                );

                if (! empty($pData['variants'])) {
                    foreach ($pData['variants'] as $vIndex => $vData) {
                        $product->variants()->updateOrCreate(
                            ['name' => $vData['name']],
                            [
                                'price' => $vData['price'],
                                'is_default' => $vData['is_default'] ?? false,
                                'is_available' => true,
                                'sort_order' => $vIndex + 1,
                            ]
                        );
                    }
                }

                if (! empty($pData['addons'])) {
                    foreach ($pData['addons'] as $aData) {
                        $product->addons()->updateOrCreate(
                            ['name' => $aData['name']],
                            [
                                'price' => $aData['price'],
                                'is_available' => true,
                            ]
                        );
                    }
                }
            }
        }
    }
}
