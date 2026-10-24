<?php

namespace Database\Seeders;

use App\Models\Combo;
use App\Models\ComboItem;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ComboSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $combos = [
            [
                'name' => 'Burger & Mojito Combo',
                'tamil_name' => 'ஊஞ்சல் பர்கர் & மொஜிட்டோ காம்போ',
                'slug' => 'burger-mojito-combo',
                'description' => 'Crispy fried chicken thigh burger paired with chilled sparkling Blue Curacao Mojito',
                'regular_price' => 1200.00,
                'combo_price' => 990.00,
                'savings_amount' => 210.00,
                'badge' => 'Best Seller',
                'is_active' => true,
                'is_featured' => true,
                'items' => [
                    ['product_name' => 'Crispy Chicken Burger', 'quantity' => 1],
                    ['product_name' => 'Blue Curacao Mojito', 'quantity' => 1],
                ],
            ],
            [
                'name' => 'Chai & Submarine Duo',
                'tamil_name' => 'மாலை சாய் & சப்மரின் காம்போ',
                'slug' => 'chai-submarine-duo',
                'description' => 'Two glasses of hot Special Masala Chai with a warm toasted spiced Chicken Submarine',
                'regular_price' => 1250.00,
                'combo_price' => 1050.00,
                'savings_amount' => 200.00,
                'badge' => 'Evening Rush',
                'is_active' => true,
                'is_featured' => true,
                'items' => [
                    ['product_name' => 'Special Masala Chai', 'quantity' => 2],
                    ['product_name' => 'Chicken Submarine', 'quantity' => 1],
                ],
            ],
            [
                'name' => 'Matka Duo & Fudgy Brownie',
                'tamil_name' => 'மட்கா சாய் & பிரவுனி காம்போ',
                'slug' => 'matka-duo-fudgy-brownie',
                'description' => 'Two Cardamom Ginger Chais served alongside warm dark chocolate fudge brownie with ice cream',
                'regular_price' => 740.00,
                'combo_price' => 620.00,
                'savings_amount' => 120.00,
                'badge' => 'Sweet Tooth',
                'is_active' => true,
                'is_featured' => false,
                'items' => [
                    ['product_name' => 'Cardamom Ginger Chai', 'quantity' => 2],
                    ['product_name' => 'Fudgy Brownie with Ice Cream', 'quantity' => 1],
                ],
            ],
            [
                'name' => 'Mega Friends Adda Feast',
                'tamil_name' => 'மெகா நண்பர்கள் ஃபீஸ்ட் (Save Rs. 500)',
                'slug' => 'mega-friends-adda-feast',
                'description' => 'Big group deal: 4x Special Masala Chai + 2x Crispy Chicken Burgers + 1x Club Sandwich',
                'regular_price' => 2750.00,
                'combo_price' => 2250.00,
                'savings_amount' => 500.00,
                'badge' => 'Save Rs. 500',
                'is_active' => true,
                'is_featured' => true,
                'items' => [
                    ['product_name' => 'Special Masala Chai', 'quantity' => 4],
                    ['product_name' => 'Crispy Chicken Burger', 'quantity' => 2],
                    ['product_name' => 'Triple Layer Club Sandwich', 'quantity' => 1],
                ],
            ],
        ];

        foreach ($combos as $cData) {
            $items = $cData['items'];
            unset($cData['items']);

            $combo = Combo::updateOrCreate(
                ['slug' => $cData['slug']],
                $cData
            );

            // Re-seed items
            $combo->items()->delete();

            foreach ($items as $it) {
                $product = Product::where('name', $it['product_name'])->first();
                if ($product) {
                    ComboItem::create([
                        'combo_id' => $combo->id,
                        'product_id' => $product->id,
                        'variant_id' => $product->variants()->first()?->id,
                        'quantity' => $it['quantity'],
                    ]);
                }
            }
        }
    }
}
