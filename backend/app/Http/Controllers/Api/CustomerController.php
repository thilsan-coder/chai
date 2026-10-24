<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers with VIP tiers and points.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::withCount('orders')
            ->where('is_active', true)
            ->latest('id');

        if ($request->filled('tier')) {
            $query->where('tier', $request->query('tier'));
        }

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->get();

        $summary = [
            'total_customers' => $customers->count(),
            'total_points_in_circulation' => $customers->sum('loyalty_points'),
            'total_revenue_from_members_lkr' => round($customers->sum('total_spent'), 2),
            'vip_count' => $customers->where('tier', 'vip')->count(),
            'gold_count' => $customers->where('tier', 'gold')->count(),
            'silver_count' => $customers->where('tier', 'silver')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $customers,
            'summary' => $summary,
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30|unique:customers,phone',
            'email' => 'nullable|email|max:100',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::create([
            ...$validated,
            'loyalty_points' => 0,
            'total_spent' => 0.00,
            'total_visits' => 0,
            'tier' => 'bronze',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Customer {$customer->name} registered successfully.",
            'data' => $customer,
        ], 201);
    }

    /**
     * Fast phone number lookup for POS counter.
     */
    public function lookup(Request $request): JsonResponse
    {
        $phone = trim($request->query('phone', ''));

        if (empty($phone) || strlen($phone) < 3) {
            return response()->json([
                'success' => true,
                'found' => false,
                'data' => null,
            ]);
        }

        // Clean spaces and special characters for search
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        $customer = Customer::where('phone', 'like', "%{$phone}%")
            ->orWhereRaw("REPLACE(REPLACE(phone, ' ', ''), '-', '') LIKE ?", ["%{$cleanPhone}%"])
            ->first();

        if ($customer) {
            return response()->json([
                'success' => true,
                'found' => true,
                'data' => $customer,
            ]);
        }

        return response()->json([
            'success' => true,
            'found' => false,
            'data' => null,
        ]);
    }

    /**
     * Display customer profile with recent order history.
     */
    public function show(int $id): JsonResponse
    {
        $customer = Customer::with(['orders.items'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    /**
     * Update customer details.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'phone' => "sometimes|string|max:30|unique:customers,phone,{$id}",
            'email' => 'nullable|email|max:100',
            'notes' => 'nullable|string',
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Customer {$customer->name} updated successfully.",
            'data' => $customer,
        ]);
    }

    /**
     * Manual loyalty points bonus or correction.
     */
    public function adjustPoints(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'points_delta' => 'required|integer', // positive or negative
            'reason' => 'required|string|max:200',
        ]);

        $delta = (int) $validated['points_delta'];
        $newPoints = max(0, $customer->loyalty_points + $delta);
        $customer->loyalty_points = $newPoints;
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => "Points updated for {$customer->name}. New balance: {$customer->loyalty_points} points.",
            'data' => $customer,
        ]);
    }
}
