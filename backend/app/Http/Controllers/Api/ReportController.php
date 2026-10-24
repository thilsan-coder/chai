<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Comprehensive Financial Report & P&L Analytics for Oonjal Chai.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $period = $request->query('period', 'today'); // today, yesterday, this_week, this_month, custom
        $tz = 'Asia/Colombo';

        $now = Carbon::now($tz);

        // Determine session date
        $currentBusinessDate = $now->hour < 4 ? $now->copy()->subDay()->toDateString() : $now->toDateString();

        switch ($period) {
            case 'yesterday':
                $businessDate = Carbon::parse($currentBusinessDate)->subDay()->toDateString();
                $startDt = Carbon::parse("{$businessDate} 04:00:00", $tz);
                $endDt = Carbon::parse("{$businessDate} 04:00:00", $tz)->addDay()->subSecond();
                $label = "Yesterday's Shift (" . Carbon::parse($businessDate)->format('d M Y') . ")";
                break;

            case 'this_week':
                $startDt = Carbon::parse($currentBusinessDate, $tz)->startOfWeek()->addHours(4);
                $endDt = Carbon::parse($currentBusinessDate, $tz)->endOfWeek()->addHours(4)->subSecond();
                $label = "This Week (" . $startDt->format('d M') . " - " . $endDt->format('d M Y') . ")";
                break;

            case 'this_month':
                $startDt = Carbon::parse($currentBusinessDate, $tz)->startOfMonth()->addHours(4);
                $endDt = Carbon::parse($currentBusinessDate, $tz)->endOfMonth()->addHours(4)->subSecond();
                $label = "This Month (" . Carbon::parse($currentBusinessDate)->format('F Y') . ")";
                break;

            case 'custom':
                $customStart = $request->query('start_date', $currentBusinessDate);
                $customEnd = $request->query('end_date', $currentBusinessDate);
                $startDt = Carbon::parse("{$customStart} 04:00:00", $tz);
                $endDt = Carbon::parse("{$customEnd} 04:00:00", $tz)->addDay()->subSecond();
                $label = "Custom Period (" . Carbon::parse($customStart)->format('d M Y') . " - " . Carbon::parse($customEnd)->format('d M Y') . ")";
                break;

            case 'today':
            default:
                $businessDate = $currentBusinessDate;
                $startDt = Carbon::parse("{$businessDate} 04:00:00", $tz);
                $endDt = Carbon::parse("{$businessDate} 04:00:00", $tz)->addDay()->subSecond();
                $label = "Today's Live Shift (4 PM - 1 AM)";
                break;
        }

        // 1. Orders within the session timeframe
        $ordersQuery = Order::with('items')
            ->whereBetween('created_at', [$startDt, $endDt])
            ->where('status', '!=', 'cancelled');

        $orders = $ordersQuery->get();

        $grossSales = (float) $orders->sum('subtotal');
        $totalDiscount = (float) $orders->sum('discount');
        $netSales = (float) $orders->sum('total');

        $totalOrdersCount = $orders->count();
        $completedOrdersCount = $orders->where('status', 'completed')->count();
        $dineInCount = $orders->where('order_type', 'dine_in')->count();
        $takeawayCount = $orders->where('order_type', 'takeaway')->count();
        $avgOrderValue = $totalOrdersCount > 0 ? round($netSales / $totalOrdersCount, 2) : 0.00;

        // 2. Expenses within the session timeframe
        $expensesQuery = Expense::where(function ($q) use ($startDt, $endDt) {
            $startDateStr = $startDt->toDateString();
            $endDateStr = $endDt->toDateString();
            $q->whereBetween('expense_date', [$startDateStr, $endDateStr])
              ->orWhereBetween('business_date', [$startDateStr, $endDateStr]);
        });

        $expenses = $expensesQuery->get();
        $totalExpenses = (float) $expenses->sum('amount');

        // P&L calculation
        $grossProfit = round($netSales - $totalExpenses, 2);
        $profitMargin = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 1) : 0.0;

        // 3. Payment Method Breakdown
        $cashSales = (float) $orders->where('payment_method', 'cash')->sum('total');
        $cardSales = (float) $orders->where('payment_method', 'card')->sum('total');
        $bankSales = (float) $orders->where('payment_method', 'bank_transfer')->sum('total');
        $qrSales = (float) $orders->where('payment_method', 'qr')->sum('total');

        // 4. Till / Cash Drawer Reconciliation
        $cashExpenses = (float) $expenses->whereIn('payment_method', ['cash', 'petty_cash'])->sum('amount');
        $expectedCashInTill = round($cashSales - $cashExpenses, 2);

        // 5. Bestselling Items in this period
        $orderIds = $orders->pluck('id');
        $bestsellers = OrderItem::whereIn('order_id', $orderIds)
            ->select(
                'product_name',
                DB::raw('SUM(quantity) as total_qty'),
                DB::raw('SUM(total_price) as total_revenue')
            )
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->product_name,
                'quantity' => (int) $item->total_qty,
                'revenue_lkr' => round((float) $item->total_revenue, 2),
            ]);

        // 6. Hourly Sales Distribution for the 4 PM – 1 AM session
        $hourlyDistribution = [];
        $shiftHours = [16, 17, 18, 19, 20, 21, 22, 23, 0, 1]; // 4 PM to 1 AM

        foreach ($shiftHours as $hour) {
            $formattedHour = Carbon::createFromTime($hour, 0, 0, $tz)->format('h A');
            $matchingOrders = $orders->filter(function ($ord) use ($hour, $tz) {
                return Carbon::parse($ord->created_at)->setTimezone($tz)->hour === $hour;
            });

            $hourlyDistribution[] = [
                'hour_num' => $hour,
                'hour_label' => $formattedHour,
                'orders_count' => $matchingOrders->count(),
                'sales_lkr' => round((float) $matchingOrders->sum('total'), 2),
            ];
        }

        // 7. Expense Category Breakdown
        $expenseCategories = $expenses->groupBy('category')->map(function ($group, $catKey) {
            return [
                'category' => $catKey,
                'total_lkr' => round((float) $group->sum('amount'), 2),
                'count' => $group->count(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'period_info' => [
                    'period' => $period,
                    'label' => $label,
                    'start' => $startDt->toIso8601String(),
                    'end' => $endDt->toIso8601String(),
                    'business_date' => $currentBusinessDate,
                ],
                'financial_summary' => [
                    'gross_sales_lkr' => round($grossSales, 2),
                    'total_discount_lkr' => round($totalDiscount, 2),
                    'net_sales_lkr' => round($netSales, 2),
                    'total_expenses_lkr' => round($totalExpenses, 2),
                    'estimated_gross_profit_lkr' => $grossProfit,
                    'profit_margin_percent' => $profitMargin,
                ],
                'payment_breakdown' => [
                    'cash_sales_lkr' => round($cashSales, 2),
                    'cash_orders_count' => $orders->where('payment_method', 'cash')->count(),
                    'card_sales_lkr' => round($cardSales, 2),
                    'card_orders_count' => $orders->where('payment_method', 'card')->count(),
                    'bank_sales_lkr' => round($bankSales, 2),
                    'bank_orders_count' => $orders->where('payment_method', 'bank_transfer')->count(),
                    'qr_sales_lkr' => round($qrSales, 2),
                    'qr_orders_count' => $orders->where('payment_method', 'qr')->count(),
                ],
                'cash_reconciliation' => [
                    'cash_sales_collected_lkr' => round($cashSales, 2),
                    'cash_expenses_paid_lkr' => round($cashExpenses, 2),
                    'expected_cash_in_till_lkr' => $expectedCashInTill,
                ],
                'order_metrics' => [
                    'total_orders' => $totalOrdersCount,
                    'completed_orders' => $completedOrdersCount,
                    'dine_in_count' => $dineInCount,
                    'takeaway_count' => $takeawayCount,
                    'average_order_value_lkr' => $avgOrderValue,
                ],
                'bestselling_items' => $bestsellers,
                'hourly_distribution' => $hourlyDistribution,
                'expense_categories' => $expenseCategories,
            ],
        ]);
    }

    /**
     * Daily Shift Sessions history (Past 14 days).
     */
    public function dailySessions(): JsonResponse
    {
        $tz = 'Asia/Colombo';
        $now = Carbon::now($tz);
        $currentBusinessDate = $now->hour < 4 ? $now->copy()->subDay()->toDateString() : $now->toDateString();

        $sessions = [];

        for ($i = 0; $i < 14; $i++) {
            $date = Carbon::parse($currentBusinessDate)->subDays($i)->toDateString();
            $startDt = Carbon::parse("{$date} 04:00:00", $tz);
            $endDt = Carbon::parse("{$date} 04:00:00", $tz)->addDay()->subSecond();

            $dayOrders = Order::whereBetween('created_at', [$startDt, $endDt])
                ->where('status', '!=', 'cancelled')
                ->get();

            $dayExpenses = Expense::where(function ($q) use ($date) {
                $q->where('business_date', $date)
                  ->orWhere('expense_date', $date);
            })->get();

            $sales = (float) $dayOrders->sum('total');
            $expenses = (float) $dayExpenses->sum('amount');
            $profit = round($sales - $expenses, 2);

            $sessions[] = [
                'business_date' => $date,
                'formatted_date' => Carbon::parse($date)->format('D, d M Y'),
                'total_orders' => $dayOrders->count(),
                'net_sales_lkr' => round($sales, 2),
                'total_expenses_lkr' => round($expenses, 2),
                'net_profit_lkr' => $profit,
                'cash_sales_lkr' => round((float) $dayOrders->where('payment_method', 'cash')->sum('total'), 2),
                'bank_card_sales_lkr' => round((float) $dayOrders->whereIn('payment_method', ['card', 'bank_transfer', 'qr'])->sum('total'), 2),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }
}
