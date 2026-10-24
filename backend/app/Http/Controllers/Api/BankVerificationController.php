<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankVerificationController extends Controller
{
    /**
     * Display listing of bank transfer and QR payment slips.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'all');

        $query = Order::with(['items', 'user', 'customer', 'verifier'])
            ->whereIn('payment_method', ['bank_transfer', 'qr'])
            ->latest('id');

        if ($status !== 'all' && in_array($status, ['pending_verification', 'verified', 'rejected'])) {
            $query->where('verification_status', $status);
        }

        $orders = $query->get();

        $allBankOrders = Order::whereIn('payment_method', ['bank_transfer', 'qr'])->get();
        $today = Carbon::today('Asia/Colombo');

        $summary = [
            'pending_count' => $allBankOrders->where('verification_status', 'pending_verification')->count(),
            'pending_amount_lkr' => round((float) $allBankOrders->where('verification_status', 'pending_verification')->sum('total'), 2),
            'verified_today_lkr' => round((float) $allBankOrders->where('verification_status', 'verified')->where('verified_at', '>=', $today)->sum('total'), 2),
            'total_bank_volume_lkr' => round((float) $allBankOrders->sum('total'), 2),
            'rejected_count' => $allBankOrders->where('verification_status', 'rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $orders,
            'summary' => $summary,
        ]);
    }

    /**
     * Owner / Manager marks bank slip verified and money credited.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $order->verification_status = 'verified';
        $order->payment_status = 'paid';
        $order->verified_by = $request->user()?->id;
        $order->verified_at = Carbon::now('Asia/Colombo');

        if ($request->filled('notes')) {
            $order->verification_notes = $request->input('notes');
        }

        $order->save();
        $order->load(['user', 'customer', 'verifier']);

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->token_number} bank transfer verified successfully.",
            'data' => $order,
        ]);
    }

    /**
     * Owner / Manager rejects bank transfer slip.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $order = Order::findOrFail($id);

        $order->verification_status = 'rejected';
        $order->payment_status = 'unpaid';
        $order->verified_by = $request->user()?->id;
        $order->verified_at = Carbon::now('Asia/Colombo');
        $order->verification_notes = $request->input('reason');
        $order->save();

        $order->load(['user', 'customer', 'verifier']);

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->token_number} bank transfer rejected. Status marked as unpaid.",
            'data' => $order,
        ]);
    }

    /**
     * Update bank slip reference number or bank name.
     */
    public function updateReference(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'bank_name' => 'nullable|string|max:50',
            'bank_reference' => 'nullable|string|max:100',
        ]);

        $order = Order::findOrFail($id);

        if ($request->filled('bank_name')) {
            $order->bank_name = $request->input('bank_name');
        }
        if ($request->filled('bank_reference')) {
            $order->bank_reference = $request->input('bank_reference');
        }

        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Bank reference details updated for order #{$order->token_number}.",
            'data' => $order,
        ]);
    }
}
