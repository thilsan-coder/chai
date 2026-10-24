<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items', 'user:id,name,role'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->query('payment_status'));
        }

        if ($request->filled('order_type')) {
            $query->where('order_type', $request->query('order_type'));
        }

        if ($request->filled('date')) {
            $date = Carbon::parse($request->query('date'), 'Asia/Colombo');
            $query->whereDate('created_at', $date->toDateString());
        } elseif ($request->boolean('today_only', false)) {
            $today = Carbon::today('Asia/Colombo')->toDateString();
            $query->whereDate('created_at', $today);
        }

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('token_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('table_number', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->query('per_page', 25);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Store a newly created order (POS Checkout).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'table_number' => 'nullable|string|max:20',
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,card,bank_transfer,qr,split',
            'bank_name' => 'nullable|string|max:50',
            'bank_reference' => 'nullable|string|max:100',
            'payment_status' => 'nullable|in:unpaid,paid,partially_paid,refunded',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'amount_tendered' => 'nullable|numeric|min:0',
            'change_due' => 'nullable|numeric|min:0',
            'points_redeemed' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.product_name' => 'required|string|max:150',
            'items.*.variant_id' => 'nullable|integer',
            'items.*.variant_name' => 'nullable|string|max:100',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.total_price' => 'required|numeric|min:0',
            'items.*.addons' => 'nullable|array',
            'items.*.notes' => 'nullable|string|max:255',
        ]);

        try {
            $order = DB::transaction(function () use ($validated, $request) {
                $orderNumber = Order::generateOrderNumber();
                $tokenNumber = Order::generateTokenNumber();

                $discount = (float) ($validated['discount'] ?? 0);
                $tax = (float) ($validated['tax'] ?? 0);
                $subtotal = (float) $validated['subtotal'];
                $total = (float) $validated['total'];

                $amountTendered = isset($validated['amount_tendered']) ? (float) $validated['amount_tendered'] : null;
                $changeDue = isset($validated['change_due']) ? (float) $validated['change_due'] : null;

                if ($amountTendered !== null && $changeDue === null) {
                    $changeDue = max(0, round($amountTendered - $total, 2));
                }

                $customerId = null;
                $pointsEarned = 0;
                $pointsRedeemed = (int) ($validated['points_redeemed'] ?? 0);

                if (!empty($validated['customer_phone']) && class_exists(\App\Models\Customer::class)) {
                    $customer = \App\Models\Customer::firstOrCreate(
                        ['phone' => trim($validated['customer_phone'])],
                        ['name' => !empty($validated['customer_name']) ? $validated['customer_name'] : 'Guest Customer', 'tier' => 'bronze']
                    );

                    $customerId = $customer->id;
                    $pointsEarned = (int) floor($total / 100);

                    $customer->total_spent += $total;
                    $customer->total_visits += 1;
                    $customer->loyalty_points = max(0, $customer->loyalty_points - $pointsRedeemed + $pointsEarned);
                    if (!empty($validated['customer_name']) && $customer->name === 'Guest Customer') {
                        $customer->name = $validated['customer_name'];
                    }
                    $customer->recalculateTier();
                }

                $isBankOrQr = in_array($validated['payment_method'], ['bank_transfer', 'qr']);

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'token_number' => $tokenNumber,
                    'order_type' => $validated['order_type'],
                    'table_number' => $validated['table_number'] ?? null,
                    'customer_name' => $validated['customer_name'] ?? null,
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'status' => 'pending',
                    'payment_status' => $validated['payment_status'] ?? 'paid',
                    'payment_method' => $validated['payment_method'],
                    'bank_name' => $validated['bank_name'] ?? null,
                    'bank_reference' => $validated['bank_reference'] ?? null,
                    'verification_status' => $isBankOrQr ? 'pending_verification' : 'verified',
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total' => $total,
                    'amount_tendered' => $amountTendered,
                    'change_due' => $changeDue,
                    'points_earned' => $pointsEarned,
                    'points_redeemed' => $pointsRedeemed,
                    'customer_id' => $customerId,
                    'notes' => $validated['notes'] ?? null,
                    'user_id' => $request->user()?->id,
                ]);

                foreach ($validated['items'] as $item) {
                    $order->items()->create([
                        'product_id' => $item['product_id'] ?? null,
                        'product_name' => $item['product_name'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'variant_name' => $item['variant_name'] ?? null,
                        'unit_price' => (float) $item['unit_price'],
                        'quantity' => (int) $item['quantity'],
                        'total_price' => (float) $item['total_price'],
                        'addons' => $item['addons'] ?? null,
                        'notes' => $item['notes'] ?? null,
                    ]);
                }

                // If dine-in with table number, update table status to occupied
                if (!empty($order->table_number) && class_exists(\App\Models\Table::class)) {
                    $table = \App\Models\Table::where('code', $order->table_number)
                        ->orWhere('name', $order->table_number)
                        ->first();
                    if ($table) {
                        $table->current_order_id = $order->id;
                        $table->status = 'occupied';
                        $table->save();
                    }
                }

                return $order->load(['items', 'user:id,name']);
            });

            return response()->json([
                'success' => true,
                'message' => "Order #{$order->token_number} placed successfully!",
                'data' => $order,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Order creation error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order with items.
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with(['items', 'user:id,name'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status or payment status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items', 'user:id,name'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:pending,preparing,ready,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,partially_paid,refunded',
        ]);

        if (isset($validated['status'])) {
            $order->status = $validated['status'];
        }

        if (isset($validated['payment_status'])) {
            $order->payment_status = $validated['payment_status'];
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->token_number} status updated to {$order->status}.",
            'data' => $order,
        ]);
    }

    /**
     * Get real-time daily summary for POS and KDS dashboard.
     */
    public function dailySummary(): JsonResponse
    {
        $today = Carbon::today('Asia/Colombo')->toDateString();

        $todayOrders = Order::whereDate('created_at', $today)->get();

        $totalSales = $todayOrders->where('payment_status', 'paid')->sum('total');
        $totalOrdersCount = $todayOrders->count();
        $pendingCount = $todayOrders->where('status', 'pending')->count();
        $preparingCount = $todayOrders->where('status', 'preparing')->count();
        $readyCount = $todayOrders->where('status', 'ready')->count();
        $completedCount = $todayOrders->where('status', 'completed')->count();
        $lastToken = $todayOrders->max('token_number') ?? 100;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $today,
                'total_orders' => $totalOrdersCount,
                'total_sales_lkr' => round($totalSales, 2),
                'pending' => $pendingCount,
                'preparing' => $preparingCount,
                'ready' => $readyCount,
                'completed' => $completedCount,
                'last_token' => $lastToken,
            ],
        ]);
    }
}
