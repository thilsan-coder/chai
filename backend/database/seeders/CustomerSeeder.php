<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Mohamed Rizwan',
                'phone' => '077 123 4567',
                'email' => 'rizwan.m@gmail.com',
                'loyalty_points' => 340,
                'total_spent' => 34500.00,
                'total_visits' => 48,
                'tier' => 'vip',
                'notes' => 'Daily evening regular (7:30 PM). Prefers extra cardamom & less sugar.',
            ],
            [
                'name' => 'Thushan Fernando',
                'phone' => '071 987 6543',
                'email' => 'thushan.fernando@yahoo.com',
                'loyalty_points' => 120,
                'total_spent' => 12400.00,
                'total_visits' => 22,
                'tier' => 'gold',
                'notes' => 'Comes with office colleagues. Loves Crispy Chicken Burger & Masala Chai.',
            ],
            [
                'name' => 'Anusha Senanayake',
                'phone' => '076 223 3445',
                'email' => 'anusha.sen@outlook.com',
                'loyalty_points' => 280,
                'total_spent' => 28900.00,
                'total_visits' => 35,
                'tier' => 'vip',
                'notes' => 'Table 3 & Balcony Swing regular. Always orders Clay Pot Chai.',
            ],
            [
                'name' => 'Sivakumar Ramanathan',
                'phone' => '077 554 4332',
                'email' => 'siva.ram@gmail.com',
                'loyalty_points' => 95,
                'total_spent' => 9800.00,
                'total_visits' => 16,
                'tier' => 'silver',
                'notes' => 'Loves ginger cardamom blend.',
            ],
            [
                'name' => 'Dilshan Wickramasinghe',
                'phone' => '075 667 7889',
                'email' => 'dilshan.w@gmail.com',
                'loyalty_points' => 60,
                'total_spent' => 6200.00,
                'total_visits' => 11,
                'tier' => 'silver',
                'notes' => 'Mojito and evening snacks fan.',
            ],
            [
                'name' => 'Fathima Zahra',
                'phone' => '076 112 2334',
                'email' => 'zahra.f@gmail.com',
                'loyalty_points' => 25,
                'total_spent' => 2600.00,
                'total_visits' => 4,
                'tier' => 'bronze',
                'notes' => 'Fudgy Brownies with Hot Chai.',
            ],
            [
                'name' => 'Kavin De Silva',
                'phone' => '072 334 4556',
                'email' => 'kavin.ds@gmail.com',
                'loyalty_points' => 15,
                'total_spent' => 1800.00,
                'total_visits' => 3,
                'tier' => 'bronze',
                'notes' => 'Chicken Submarine takeaway regular.',
            ],
            [
                'name' => 'Pradeep Jayasuriya',
                'phone' => '077 889 9001',
                'email' => 'pradeep.j@sltnet.lk',
                'loyalty_points' => 85,
                'total_spent' => 8900.00,
                'total_visits' => 14,
                'tier' => 'silver',
                'notes' => 'Weekend family visits.',
            ],
        ];

        foreach ($customers as $data) {
            Customer::updateOrCreate(
                ['phone' => $data['phone']],
                $data
            );
        }
    }
}
