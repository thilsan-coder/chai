<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffUserSeeder extends Seeder
{
    /**
     * Seed initial staff users with roles for Oonjal Chai.
     */
    public function run(): void
    {
        $staffUsers = [
            [
                'name' => 'Oonjal Chai Owner',
                'email' => 'owner@oonjalchai.lk',
                'password' => Hash::make('password123'),
                'role' => 'owner',
                'phone' => '+94 77 123 4567',
                'pin_code' => '1111',
                'is_active' => true,
            ],
            [
                'name' => 'Shift Manager',
                'email' => 'manager@oonjalchai.lk',
                'password' => Hash::make('password123'),
                'role' => 'manager',
                'phone' => '+94 77 234 5678',
                'pin_code' => '2222',
                'is_active' => true,
            ],
            [
                'name' => 'Front Cashier',
                'email' => 'cashier@oonjalchai.lk',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
                'phone' => '+94 77 345 6789',
                'pin_code' => '3333',
                'is_active' => true,
            ],
            [
                'name' => 'Kitchen Master',
                'email' => 'kitchen@oonjalchai.lk',
                'password' => Hash::make('password123'),
                'role' => 'kitchen',
                'phone' => '+94 77 456 7890',
                'pin_code' => '4444',
                'is_active' => true,
            ],
            [
                'name' => 'Stock Manager',
                'email' => 'stock@oonjalchai.lk',
                'password' => Hash::make('password123'),
                'role' => 'stock_manager',
                'phone' => '+94 77 567 8901',
                'pin_code' => '5555',
                'is_active' => true,
            ],
        ];

        foreach ($staffUsers as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
