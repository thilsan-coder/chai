<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::withCount('inventoryItems')
            ->where('is_active', true)
            ->latest('id');

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('supplied_categories', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->get();

        return response()->json([
            'success' => true,
            'data' => $suppliers,
            'count' => $suppliers->count(),
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'required|string|max:30|unique:suppliers,phone',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:255',
            'supplied_categories' => 'nullable|string|max:150',
            'notes' => 'nullable|string',
        ]);

        $supplier = Supplier::create([
            ...$validated,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Supplier {$supplier->name} added successfully.",
            'data' => $supplier,
        ], 201);
    }

    /**
     * Update an existing supplier.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'phone' => "sometimes|string|max:30|unique:suppliers,phone,{$id}",
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string|max:255',
            'supplied_categories' => 'nullable|string|max:150',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Supplier {$supplier->name} updated successfully.",
            'data' => $supplier,
        ]);
    }

    /**
     * Delete / deactivate a supplier.
     */
    public function destroy(int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->is_active = false;
        $supplier->save();

        return response()->json([
            'success' => true,
            'message' => "Supplier {$supplier->name} removed.",
        ]);
    }
}
