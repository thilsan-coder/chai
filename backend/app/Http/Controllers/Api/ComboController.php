<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\ComboItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ComboController extends Controller
{
    /**
     * Display a listing of combo bundle promotions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Combo::with(['items.product', 'items.variant'])->latest('id');

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $combos = $query->get();

        $summary = [
            'total_combos' => $combos->count(),
            'active_combos' => $combos->where('is_active', true)->count(),
            'max_savings_lkr' => (float) $combos->max('savings_amount'),
            'average_discount_lkr' => $combos->count() > 0 ? round((float) $combos->avg('savings_amount'), 2) : 0.0,
        ];

        return response()->json([
            'success' => true,
            'data' => $combos,
            'summary' => $summary,
        ]);
    }

    /**
     * Store a newly created combo bundle.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'tamil_name' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'regular_price' => 'required|numeric|min:1',
            'combo_price' => 'required|numeric|min:1|lte:regular_price',
            'badge' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $savings = max(0, (float) $validated['regular_price'] - (float) $validated['combo_price']);

        $combo = Combo::create([
            'name' => $validated['name'],
            'tamil_name' => $validated['tamil_name'] ?? null,
            'slug' => Str::slug($validated['name']) . '-' . rand(100, 999),
            'description' => $validated['description'] ?? null,
            'regular_price' => $validated['regular_price'],
            'combo_price' => $validated['combo_price'],
            'savings_amount' => $savings,
            'badge' => $validated['badge'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        foreach ($validated['items'] as $item) {
            ComboItem::create([
                'combo_id' => $combo->id,
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'quantity' => $item['quantity'],
            ]);
        }

        $combo->load(['items.product', 'items.variant']);

        return response()->json([
            'success' => true,
            'message' => "Combo '{$combo->name}' created successfully.",
            'data' => $combo,
        ], 201);
    }

    /**
     * Display the specified combo.
     */
    public function show(int $id): JsonResponse
    {
        $combo = Combo::with(['items.product', 'items.variant'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $combo,
        ]);
    }

    /**
     * Update the specified combo.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $combo = Combo::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'tamil_name' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'regular_price' => 'sometimes|numeric|min:1',
            'combo_price' => 'sometimes|numeric|min:1',
            'badge' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $regPrice = (float) ($validated['regular_price'] ?? $combo->regular_price);
        $comboPrice = (float) ($validated['combo_price'] ?? $combo->combo_price);
        $validated['savings_amount'] = max(0, $regPrice - $comboPrice);

        $combo->update($validated);

        if (isset($validated['items'])) {
            $combo->items()->delete();
            foreach ($validated['items'] as $item) {
                ComboItem::create([
                    'combo_id' => $combo->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                ]);
            }
        }

        $combo->load(['items.product', 'items.variant']);

        return response()->json([
            'success' => true,
            'message' => "Combo '{$combo->name}' updated successfully.",
            'data' => $combo,
        ]);
    }

    /**
     * Toggle combo availability.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        $combo = Combo::findOrFail($id);
        $combo->is_active = !$combo->is_active;
        $combo->save();

        return response()->json([
            'success' => true,
            'message' => "Combo '{$combo->name}' is now " . ($combo->is_active ? 'Active' : 'Inactive'),
            'data' => $combo,
        ]);
    }

    /**
     * Remove the specified combo.
     */
    public function destroy(int $id): JsonResponse
    {
        $combo = Combo::findOrFail($id);
        $name = $combo->name;
        $combo->delete();

        return response()->json([
            'success' => true,
            'message' => "Combo '{$name}' deleted successfully.",
        ]);
    }
}
