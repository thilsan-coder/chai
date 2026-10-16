<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * List all menu categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('products')->orderBy('sort_order', 'asc');

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:120|unique:categories,slug',
            'description' => 'nullable|string|max:500',
            'image_url' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Display a single category with its products.
     */
    public function show(Category $category): JsonResponse
    {
        $category->load(['products' => function ($query) {
            $query->with(['variants', 'addons'])->orderBy('sort_order', 'asc');
        }]);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Update an existing category.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'nullable|string|max:120|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string|max:500',
            'image_url' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
