<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TableController extends Controller
{
    /**
     * Display a listing of tables with real-time occupancy and active running order.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Table::with(['currentOrder.items'])->where('is_active', true)->orderBy('sort_order', 'asc');

        if ($request->filled('section')) {
            $query->where('floor_section', $request->query('section'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $tables = $query->get();

        // Self-heal table status if its current order was completed or cancelled
        foreach ($tables as $table) {
            if ($table->current_order_id && $table->currentOrder) {
                if (in_array($table->currentOrder->status, ['completed', 'cancelled'])) {
                    $table->current_order_id = null;
                    $table->status = 'available';
                    $table->save();
                }
            } elseif ($table->status === 'occupied' && !$table->current_order_id) {
                $table->status = 'available';
                $table->save();
            }
        }

        $summary = [
            'total' => $tables->count(),
            'available' => $tables->where('status', 'available')->count(),
            'occupied' => $tables->where('status', 'occupied')->count(),
            'reserved' => $tables->where('status', 'reserved')->count(),
            'cleaning' => $tables->where('status', 'cleaning')->count(),
            'seated_capacity' => $tables->where('status', 'occupied')->sum('capacity'),
        ];

        return response()->json([
            'success' => true,
            'data' => $tables,
            'summary' => $summary,
        ]);
    }

    /**
     * Store a newly created table.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'code' => 'required|string|max:15|unique:tables,code',
            'capacity' => 'required|integer|min:1|max:30',
            'floor_section' => 'required|in:indoor_ground,outdoor_verandah,balcony_swing,ac_family',
            'sort_order' => 'nullable|integer',
        ]);

        $table = Table::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'capacity' => $validated['capacity'],
            'floor_section' => $validated['floor_section'],
            'status' => 'available',
            'sort_order' => $validated['sort_order'] ?? (Table::max('sort_order') + 1),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Table {$table->name} created.",
            'data' => $table,
        ], 201);
    }

    /**
     * Update table details or manual status.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $table = Table::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'capacity' => 'sometimes|integer|min:1|max:30',
            'floor_section' => 'sometimes|in:indoor_ground,outdoor_verandah,balcony_swing,ac_family',
            'status' => 'sometimes|in:available,occupied,reserved,cleaning',
        ]);

        $table->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Table {$table->name} updated.",
            'data' => $table->load('currentOrder.items'),
        ]);
    }

    /**
     * Transfer running order from one table to another.
     */
    public function transfer(Request $request, int $id): JsonResponse
    {
        $sourceTable = Table::with('currentOrder')->findOrFail($id);

        if (!$sourceTable->current_order_id || !$sourceTable->currentOrder) {
            return response()->json([
                'success' => false,
                'message' => "Table {$sourceTable->name} does not have an active running order.",
            ], 422);
        }

        $validated = $request->validate([
            'destination_table_id' => 'required|integer|exists:tables,id|different:id',
        ]);

        $destTable = Table::findOrFail($validated['destination_table_id']);

        if ($destTable->status === 'occupied') {
            return response()->json([
                'success' => false,
                'message' => "Destination table {$destTable->name} is already occupied.",
            ], 422);
        }

        DB::transaction(function () use ($sourceTable, $destTable) {
            $order = $sourceTable->currentOrder;

            // Update order table number
            $order->table_number = $destTable->code;
            $order->save();

            // Assign to new table
            $destTable->current_order_id = $order->id;
            $destTable->status = 'occupied';
            $destTable->save();

            // Release source table to cleaning / available
            $sourceTable->current_order_id = null;
            $sourceTable->status = 'cleaning';
            $sourceTable->save();
        });

        return response()->json([
            'success' => true,
            'message' => "Order transferred from {$sourceTable->name} to {$destTable->name} successfully.",
            'data' => [
                'source_table' => $sourceTable->fresh(),
                'destination_table' => $destTable->fresh('currentOrder.items'),
            ],
        ]);
    }

    /**
     * Mark table clean and available.
     */
    public function release(int $id): JsonResponse
    {
        $table = Table::findOrFail($id);
        $table->current_order_id = null;
        $table->status = 'available';
        $table->save();

        return response()->json([
            'success' => true,
            'message' => "Table {$table->name} is now available.",
            'data' => $table,
        ]);
    }
}
