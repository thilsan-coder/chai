<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = User::where('role', 'owner')->first() ?? User::first();
        $userId = $owner?->id;

        $today = Carbon::now('Asia/Colombo')->toDateString();
        $yesterday = Carbon::now('Asia/Colombo')->subDay()->toDateString();

        $expenses = [
            [
                'expense_number' => 'EXP-20261023-001',
                'category' => 'gas_cylinder',
                'title' => 'Litro 12.5kg LP Gas Cylinder Refill (Kitchen Chai Boiler)',
                'amount' => 4200.00,
                'payment_method' => 'cash',
                'paid_to' => 'Pettah Gas Agency',
                'receipt_number' => 'INV-9821',
                'expense_date' => $yesterday,
                'business_date' => $yesterday,
                'notes' => 'Backup cylinder replaced for primary chai counter',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261023-002',
                'category' => 'market_produce',
                'title' => 'Fresh Cow Milk - 35 Litres (Direct Farm Supply)',
                'amount' => 8750.00,
                'payment_method' => 'cash',
                'paid_to' => 'Gampaha Fresh Dairy',
                'receipt_number' => 'RC-104',
                'expense_date' => $yesterday,
                'business_date' => $yesterday,
                'notes' => 'Pure unpasteurized buffalo & cow milk blend for Dum Chai',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-001',
                'category' => 'packaging',
                'title' => 'Clay Kulhad Chai Pots - 400 pcs Special Pack',
                'amount' => 4000.00,
                'payment_method' => 'bank_transfer',
                'paid_to' => 'Kelaniya Pottery Works',
                'receipt_number' => 'BT-77291',
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Authentic terracotta cups for Matka Chai',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-002',
                'category' => 'utilities',
                'title' => 'CEB Commercial Electricity Bill (October Part)',
                'amount' => 16500.00,
                'payment_method' => 'bank_transfer',
                'paid_to' => 'Ceylon Electricity Board',
                'receipt_number' => 'CEB-48192',
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Direct debit via Commercial Bank online account',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-003',
                'category' => 'market_produce',
                'title' => 'Fresh Mint, Fresh Ginger & Lemons (Daily Market)',
                'amount' => 1850.00,
                'payment_method' => 'petty_cash',
                'paid_to' => 'Manning Market Pettah',
                'receipt_number' => null,
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Pudina mint for mojito, fresh ginger for Adrak Chai',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-004',
                'category' => 'maintenance',
                'title' => 'Tea Boiler Heating Element Servicing',
                'amount' => 3200.00,
                'payment_method' => 'cash',
                'paid_to' => 'City Catering Repairs',
                'receipt_number' => 'INV-342',
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Routine monthly de-scaling and thermostat calibration',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-005',
                'category' => 'staff_welfare',
                'title' => 'Staff Shift Dinner & Tea Welfare',
                'amount' => 1500.00,
                'payment_method' => 'petty_cash',
                'paid_to' => 'Local Food Corner',
                'receipt_number' => null,
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Night shift food allowance for 4 kitchen & floor boys',
                'user_id' => $userId,
                'is_approved' => true,
            ],
            [
                'expense_number' => 'EXP-20261024-006',
                'category' => 'cleaning_misc',
                'title' => 'Floor Detergent, Dishwashing Liquid & Sanitizer',
                'amount' => 2400.00,
                'payment_method' => 'cash',
                'paid_to' => 'Keells Supermarket',
                'receipt_number' => 'KS-9102',
                'expense_date' => $today,
                'business_date' => $today,
                'notes' => 'Cafe hygiene and sanitation supplies',
                'user_id' => $userId,
                'is_approved' => true,
            ],
        ];

        foreach ($expenses as $item) {
            Expense::updateOrCreate(
                ['expense_number' => $item['expense_number']],
                $item
            );
        }
    }
}
