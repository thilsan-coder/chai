<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses with Sri Lankan operational metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('user:id,name,role')->latest('expense_date')->latest('id');

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->query('payment_method'));
        }

        if ($request->filled('date')) {
            $query->where('expense_date', $request->query('date'));
        } elseif ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('expense_date', [$request->query('start_date'), $request->query('end_date')]);
        }

        if ($request->filled('search')) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('paid_to', 'like', "%{$search}%")
                  ->orWhere('receipt_number', 'like', "%{$search}%")
                  ->orWhere('expense_number', 'like', "%{$search}%");
            });
        }

        $expenses = $query->get();

        $todayBusinessDate = Expense::calculateBusinessDate();

        $allExpenses = Expense::all();
        $todayExpenses = $allExpenses->where('business_date', $todayBusinessDate);

        // Category breakdown
        $categoryBreakdown = [];
        $categories = [
            'gas_cylinder' => 'Gas Cylinder (Litro/Laugfs)',
            'market_produce' => 'Daily Market & Fresh Milk',
            'packaging' => 'Clay Pots & Packaging',
            'utilities' => 'CEB Electricity & Water',
            'maintenance' => 'Repairs & Tea Boiler',
            'staff_welfare' => 'Staff Food & Welfare',
            'rent_rates' => 'Shop Rent & Council Rates',
            'cleaning_misc' => 'Hygiene & Miscellaneous',
        ];

        foreach ($categories as $key => $label) {
            $categoryBreakdown[$key] = [
                'key' => $key,
                'label' => $label,
                'total_lkr' => round((float) $allExpenses->where('category', $key)->sum('amount'), 2),
                'count' => $allExpenses->where('category', $key)->count(),
            ];
        }

        $summary = [
            'total_expenses_lkr' => round((float) $allExpenses->sum('amount'), 2),
            'today_expenses_lkr' => round((float) $todayExpenses->sum('amount'), 2),
            'cash_petty_expenses_lkr' => round((float) $allExpenses->whereIn('payment_method', ['cash', 'petty_cash'])->sum('amount'), 2),
            'bank_expenses_lkr' => round((float) $allExpenses->whereIn('payment_method', ['bank_transfer', 'card'])->sum('amount'), 2),
            'total_count' => $allExpenses->count(),
            'filtered_total_lkr' => round((float) $expenses->sum('amount'), 2),
            'category_breakdown' => array_values($categoryBreakdown),
        ];

        return response()->json([
            'success' => true,
            'data' => $expenses,
            'summary' => $summary,
        ]);
    }

    /**
     * Store a newly created expense record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:gas_cylinder,utilities,market_produce,packaging,maintenance,staff_welfare,rent_rates,cleaning_misc',
            'title' => 'required|string|max:150',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,petty_cash,bank_transfer,card',
            'paid_to' => 'nullable|string|max:100',
            'receipt_number' => 'nullable|string|max:50',
            'expense_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $expenseDate = !empty($validated['expense_date'])
            ? Carbon::parse($validated['expense_date'])->toDateString()
            : Carbon::now('Asia/Colombo')->toDateString();

        $businessDate = Expense::calculateBusinessDate(
            !empty($validated['expense_date']) ? Carbon::parse($validated['expense_date']) : null
        );

        $expenseNumber = Expense::generateExpenseNumber();

        $expense = Expense::create([
            'expense_number' => $expenseNumber,
            'category' => $validated['category'],
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'paid_to' => $validated['paid_to'] ?? null,
            'receipt_number' => $validated['receipt_number'] ?? null,
            'expense_date' => $expenseDate,
            'business_date' => $businessDate,
            'notes' => $validated['notes'] ?? null,
            'user_id' => $request->user()?->id,
            'is_approved' => true,
        ]);

        $expense->load('user:id,name,role');

        return response()->json([
            'success' => true,
            'message' => "Expense {$expense->expense_number} recorded successfully.",
            'data' => $expense,
        ], 201);
    }

    /**
     * Display the specified expense.
     */
    public function show(int $id): JsonResponse
    {
        $expense = Expense::with('user:id,name,role')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $expense,
        ]);
    }

    /**
     * Update the specified expense.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'category' => 'sometimes|string|in:gas_cylinder,utilities,market_produce,packaging,maintenance,staff_welfare,rent_rates,cleaning_misc',
            'title' => 'sometimes|string|max:150',
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_method' => 'sometimes|string|in:cash,petty_cash,bank_transfer,card',
            'paid_to' => 'nullable|string|max:100',
            'receipt_number' => 'nullable|string|max:50',
            'expense_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        if (!empty($validated['expense_date'])) {
            $validated['business_date'] = Expense::calculateBusinessDate(Carbon::parse($validated['expense_date']));
        }

        $expense->update($validated);
        $expense->load('user:id,name,role');

        return response()->json([
            'success' => true,
            'message' => "Expense {$expense->expense_number} updated successfully.",
            'data' => $expense,
        ]);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $number = $expense->expense_number;
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => "Expense {$number} deleted successfully.",
        ]);
    }
}
