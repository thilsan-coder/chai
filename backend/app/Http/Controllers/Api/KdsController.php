<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KdsController extends Controller
{
    /**
     * Get active kitchen orders for KDS display (Pending, Preparing, Ready).
     */
    public function orders(Request $request): JsonResponse
    {
        $station = $request->query('station', 'all'); // 'all', 'drinks', 'food'
        $status = $request->query('status'); // optional specific status

        $query = Order::with(['items.product.category', 'user:id,name'])
            ->whereDate('created_at', Carbon::today('Asia/Colombo')->toDateString());

        if ($status) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['pending', 'preparing', 'ready']);
        }

        if ($station === 'drinks') {
            $query->whereHas('items.product.category', function ($q) {
                $q->whereIn('slug', ['chai', 'hot-drinks', 'cold-beverages'])
                  ->orWhere('name', 'like', '%chai%')
                  ->orWhere('name', 'like', '%drink%')
                  ->orWhere('name', 'like', '%beverage%');
            });
        } elseif ($station === 'food') {
            $query->whereHas('items.product.category', function ($q) {
                $q->whereIn('slug', ['burgers-subs', 'snacks-quick-bites', 'desserts'])
                  ->orWhere('name', 'like', '%burger%')
                  ->orWhere('name', 'like', '%snack%')
                  ->orWhere('name', 'like', '%food%');
            });
        }

        // Custom order: preparing first, then pending, then ready; then oldest first (FIFO)
        $orders = $query->get()->sortBy(function ($order) {
            $priority = match ($order->status) {
                'preparing' => 1,
                'pending' => 2,
                'ready' => 3,
                default => 4,
            };
            return sprintf('%d_%s', $priority, $order->created_at->toIso8601String());
        })->values();

        return response()->json([
            'success' => true,
            'data' => $orders,
            'count' => $orders->count(),
        ]);
    }

    /**
     * Fast status transition for kitchen crew.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items.product.category', 'user:id,name'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Kitchen ticket not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        $order->status = $validated['status'];
        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Ticket #{$order->token_number} marked as {$order->status}.",
            'data' => $order,
        ]);
    }

    /**
     * Kitchen efficiency stats and prep times.
     */
    public function stats(): JsonResponse
    {
        $today = Carbon::today('Asia/Colombo')->toDateString();
        $todayOrders = Order::whereDate('created_at', $today)->get();

        $pending = $todayOrders->where('status', 'pending')->count();
        $preparing = $todayOrders->where('status', 'preparing')->count();
        $ready = $todayOrders->where('status', 'ready')->count();
        $completed = $todayOrders->where('status', 'completed')->count();

        // Calculate average prep time for today's completed orders (in minutes)
        $completedOrders = $todayOrders->where('status', 'completed');
        $totalPrepMinutes = 0;
        $validCompletedCount = 0;

        foreach ($completedOrders as $ord) {
            if ($ord->updated_at && $ord->created_at) {
                $diff = $ord->created_at->diffInMinutes($ord->updated_at);
                if ($diff >= 0 && $diff <= 120) { // filter outliers
                    $totalPrepMinutes += $diff;
                    $validCompletedCount++;
                }
            }
        }

        $avgPrepTime = $validCompletedCount > 0 ? round($totalPrepMinutes / $validCompletedCount, 1) : 4.5;

        return response()->json([
            'success' => true,
            'data' => [
                'active_queue' => $pending + $preparing,
                'pending' => $pending,
                'preparing' => $preparing,
                'ready' => $ready,
                'completed' => $completed,
                'avg_prep_time_minutes' => $avgPrepTime,
            ],
        ]);
    }
}
