<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAddon;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * List all products with category and variant information.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants', 'addons'])
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('available_only')) {
            $query->where('is_available', true);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'data' => $products,
        ]);
    }

    /**
     * Store a new product along with optional variants and add-ons.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:150',
            'slug' => 'nullable|string|max:180|unique:products,slug',
            'description' => 'nullable|string|max:1000',
            'base_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'preparation_time_minutes' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required_with:variants|string|max:80',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.is_default' => 'nullable|boolean',
            'addons' => 'nullable|array',
            'addons.*.name' => 'required_with:addons|string|max:80',
            'addons.*.price' => 'required_with:addons|numeric|min:0',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product = DB::transaction(function () use ($validated, $request) {
            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'base_price' => $validated['base_price'],
                'cost_price' => $validated['cost_price'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'is_available' => $validated['is_available'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
                'preparation_time_minutes' => $validated['preparation_time_minutes'] ?? 5,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            // Save variants if present
            if (! empty($validated['variants'])) {
                foreach ($validated['variants'] as $v) {
                    $product->variants()->create([
                        'name' => $v['name'],
                        'price' => $v['price'],
                        'is_default' => $v['is_default'] ?? false,
                        'is_available' => true,
                    ]);
                }
            }

            // Save add-ons if present
            if (! empty($validated['addons'])) {
                foreach ($validated['addons'] as $a) {
                    $product->addons()->create([
                        'name' => $a['name'],
                        'price' => $a['price'],
                        'is_available' => true,
                    ]);
                }
            }

            return $product->load(['category', 'variants', 'addons']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product,
        ], 201);
    }

    /**
     * Display a single product.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'variants', 'addons']);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Update an existing product and its variants / add-ons.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:150',
            'slug' => 'nullable|string|max:180|unique:products,slug,' . $product->id,
            'description' => 'nullable|string|max:1000',
            'base_price' => 'sometimes|required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'preparation_time_minutes' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer',
            'variants.*.name' => 'required_with:variants|string|max:80',
            'variants.*.price' => 'required_with:variants|numeric|min:0',
            'variants.*.is_default' => 'nullable|boolean',
            'addons' => 'nullable|array',
            'addons.*.id' => 'nullable|integer',
            'addons.*.name' => 'required_with:addons|string|max:80',
            'addons.*.price' => 'required_with:addons|numeric|min:0',
        ]);

        $product = DB::transaction(function () use ($validated, $product, $request) {
            $product->update($validated);

            // Sync variants if array provided
            if ($request->has('variants')) {
                $incomingVariantIds = [];
                foreach ($request->input('variants', []) as $vData) {
                    if (! empty($vData['id'])) {
                        $variant = ProductVariant::where('product_id', $product->id)->find($vData['id']);
                        if ($variant) {
                            $variant->update([
                                'name' => $vData['name'],
                                'price' => $vData['price'],
                                'is_default' => $vData['is_default'] ?? false,
                            ]);
                            $incomingVariantIds[] = $variant->id;
                        }
                    } else {
                        $newVariant = $product->variants()->create([
                            'name' => $vData['name'],
                            'price' => $vData['price'],
                            'is_default' => $vData['is_default'] ?? false,
                            'is_available' => true,
                        ]);
                        $incomingVariantIds[] = $newVariant->id;
                    }
                }
                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();
            }

            // Sync addons if array provided
            if ($request->has('addons')) {
                $incomingAddonIds = [];
                foreach ($request->input('addons', []) as $aData) {
                    if (! empty($aData['id'])) {
                        $addon = ProductAddon::where('product_id', $product->id)->find($aData['id']);
                        if ($addon) {
                            $addon->update([
                                'name' => $aData['name'],
                                'price' => $aData['price'],
                            ]);
                            $incomingAddonIds[] = $addon->id;
                        }
                    } else {
                        $newAddon = $product->addons()->create([
                            'name' => $aData['name'],
                            'price' => $aData['price'],
                            'is_available' => true,
                        ]);
                        $incomingAddonIds[] = $newAddon->id;
                    }
                }
                $product->addons()->whereNotIn('id', $incomingAddonIds)->delete();
            }

            return $product->fresh(['category', 'variants', 'addons']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product,
        ]);
    }

    /**
     * Fast toggle availability (In stock / Out of stock).
     */
    public function toggleAvailability(Product $product): JsonResponse
    {
        $product->update([
            'is_available' => ! $product->is_available,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product availability updated',
            'is_available' => $product->is_available,
        ]);
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}
