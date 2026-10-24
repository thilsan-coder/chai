<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            // Indoor Ground Floor
            [
                'name' => 'Indoor Table 1',
                'code' => 'T-01',
                'capacity' => 2,
                'floor_section' => 'indoor_ground',
                'status' => 'available',
                'sort_order' => 1,
            ],
            [
                'name' => 'Indoor Table 2',
                'code' => 'T-02',
                'capacity' => 4,
                'floor_section' => 'indoor_ground',
                'status' => 'available',
                'sort_order' => 2,
            ],
            [
                'name' => 'Indoor Table 3',
                'code' => 'T-03',
                'capacity' => 4,
                'floor_section' => 'indoor_ground',
                'status' => 'available',
                'sort_order' => 3,
            ],
            [
                'name' => 'Indoor Table 4',
                'code' => 'T-04',
                'capacity' => 6,
                'floor_section' => 'indoor_ground',
                'status' => 'available',
                'sort_order' => 4,
            ],

            // Outdoor Verandah
            [
                'name' => 'Verandah Garden 1',
                'code' => 'OV-01',
                'capacity' => 4,
                'floor_section' => 'outdoor_verandah',
                'status' => 'available',
                'sort_order' => 5,
            ],
            [
                'name' => 'Verandah Garden 2',
                'code' => 'OV-02',
                'capacity' => 4,
                'floor_section' => 'outdoor_verandah',
                'status' => 'available',
                'sort_order' => 6,
            ],
            [
                'name' => 'Verandah Garden 3',
                'code' => 'OV-03',
                'capacity' => 2,
                'floor_section' => 'outdoor_verandah',
                'status' => 'available',
                'sort_order' => 7,
            ],

            // Oonjal Balcony Swing Tables (Signature Cafe Feature)
            [
                'name' => 'ஊஞ்சல் Swing 1',
                'code' => 'SW-01',
                'capacity' => 2,
                'floor_section' => 'balcony_swing',
                'status' => 'available',
                'sort_order' => 8,
            ],
            [
                'name' => 'ஊஞ்சல் Swing 2',
                'code' => 'SW-02',
                'capacity' => 2,
                'floor_section' => 'balcony_swing',
                'status' => 'available',
                'sort_order' => 9,
            ],
            [
                'name' => 'ஊஞ்சல் Swing 3',
                'code' => 'SW-03',
                'capacity' => 4,
                'floor_section' => 'balcony_swing',
                'status' => 'available',
                'sort_order' => 10,
            ],

            // AC Family Cabin
            [
                'name' => 'AC Cabin Table 1',
                'code' => 'AC-01',
                'capacity' => 6,
                'floor_section' => 'ac_family',
                'status' => 'available',
                'sort_order' => 11,
            ],
            [
                'name' => 'AC Cabin Table 2 (VIP)',
                'code' => 'AC-02',
                'capacity' => 8,
                'floor_section' => 'ac_family',
                'status' => 'available',
                'sort_order' => 12,
            ],
        ];

        foreach ($tables as $data) {
            Table::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }
    }
}
