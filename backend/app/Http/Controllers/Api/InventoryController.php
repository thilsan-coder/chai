<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\ProductRecipe;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Display a listing of raw materials & inventory items.
     */
    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::with('supplier:id,name,phone')
            ->where('is_active', true)
            ->latest('id');

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->boolean('low_stock_only', false)) {
            $query->whereColumn('current_stock', '<=', 'min_stock_alert');
        }

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $items = $query->get();

        $summary = [
            'total_items' => $items->count(),
            'low_stock_count' => $items->filter(fn ($i) => $i->isLowStock())->count(),
            'total_valuation_lkr' => round($items->sum(fn ($i) => $i->current_stock * $i->cost_per_unit), 2),
        ];

        return response()->json([
            'success' => true,
            'data' => $items,
            'summary' => $summary,
        ]);
    }

    /**
     * Create a new inventory raw item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:30|unique:inventory_items,code',
            'category' => 'required|in:dairy,tea_spices,bakery_meats,packaging,beverages,syrups_extras',
            'unit' => 'required|string|max:20',
            'current_stock' => 'nullable|numeric|min:0',
            'min_stock_alert' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $item = InventoryItem::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'category' => $validated['category'],
            'unit' => $validated['unit'],
            'current_stock' => (float) ($validated['current_stock'] ?? 0),
            'min_stock_alert' => (float) $validated['min_stock_alert'],
            'cost_per_unit' => (float) $validated['cost_per_unit'],
            'supplier_id' => $validated['supplier_id'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Item {$item->name} created successfully.",
            'data' => $item->load('supplier'),
        ], 201);
    }

    /**
     * Update an inventory item.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'category' => 'sometimes|in:dairy,tea_spices,bakery_meats,packaging,beverages,syrups_extras',
            'unit' => 'sometimes|string|max:20',
            'min_stock_alert' => 'sometimes|numeric|min:0',
            'cost_per_unit' => 'sometimes|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Item {$item->name} updated successfully.",
            'data' => $item->load('supplier'),
        ]);
    }

    /**
     * Record Incoming Stock Purchase (Stock In).
     */
    public function stockIn(Request $request, int $id): JsonResponse
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'cost_price' => 'nullable|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $quantity = (float) $validated['quantity'];
        $costPrice = isset($validated['cost_price']) ? (float) $validated['cost_price'] : $item->cost_per_unit;

        $movement = DB::transaction(function () use ($item, $quantity, $costPrice, $validated, $request) {
            $newStock = $item->current_stock + $quantity;
            $item->current_stock = $newStock;
            if (isset($validated['cost_price'])) {
                $item->cost_per_unit = $costPrice;
            }
            $item->save();

            return StockMovement::create([
                'inventory_item_id' => $item->id,
                'movement_type' => 'purchase_in',
                'quantity' => $quantity,
                'balance_after' => $newStock,
                'cost_price' => $costPrice,
                'reference' => $validated['reference'] ?? 'Purchase Stock In',
                'notes' => $validated['notes'] ?? null,
                'user_id' => $request->user()?->id,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => "Added {$quantity} {$item->unit} to {$item->name}. New balance: {$item->current_stock} {$item->unit}.",
            'data' => [
                'item' => $item->fresh('supplier'),
                'movement' => $movement,
            ],
        ]);
    }

    /**
     * Record Spoilage / Waste / Physical Inventory Adjustment.
     */
    public function stockAdjust(Request $request, int $id): JsonResponse
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'movement_type' => 'required|in:waste_spoilage,adjustment',
            'quantity' => 'required|numeric', // positive reduction or adjustment
            'notes' => 'required|string|max:255',
        ]);

        $quantity = (float) $validated['quantity'];
        $type = $validated['movement_type'];

        $movement = DB::transaction(function () use ($item, $quantity, $type, $validated, $request) {
            if ($type === 'waste_spoilage') {
                $newStock = max(0, $item->current_stock - abs($quantity));
            } else {
                // Direct new stock setting or delta
                $newStock = max(0, $item->current_stock + $quantity);
            }

            $item->current_stock = $newStock;
            $item->save();

            return StockMovement::create([
                'inventory_item_id' => $item->id,
                'movement_type' => $type,
                'quantity' => -abs($quantity),
                'balance_after' => $newStock,
                'cost_price' => $item->cost_per_unit,
                'reference' => $type === 'waste_spoilage' ? 'Kitchen Spoilage / Waste' : 'Stock Audit Adjustment',
                'notes' => $validated['notes'],
                'user_id' => $request->user()?->id,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => "Stock adjusted for {$item->name}. New balance: {$item->current_stock} {$item->unit}.",
            'data' => [
                'item' => $item->fresh('supplier'),
                'movement' => $movement,
            ],
        ]);
    }

    /**
     * Get items that are currently below threshold alert.
     */
    public function lowStockAlerts(): JsonResponse
    {
        $lowItems = InventoryItem::with('supplier:id,name,phone')
            ->where('is_active', true)
            ->whereColumn('current_stock', '<=', 'min_stock_alert')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $lowItems->count(),
            'data' => $lowItems,
        ]);
    }

    /**
     * Get Bill of Materials / Recipe for a specific Product.
     */
    public function recipes(int $productId): JsonResponse
    {
        $recipes = ProductRecipe::with(['inventoryItem', 'variant'])
            ->where('product_id', $productId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $recipes,
        ]);
    }
}
