<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_number',
        'category',
        'title',
        'amount',
        'payment_method',
        'paid_to',
        'receipt_number',
        'expense_date',
        'business_date',
        'notes',
        'user_id',
        'is_approved',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'business_date' => 'date',
        'is_approved' => 'boolean',
    ];

    /**
     * Staff who recorded the expense.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate unique sequential expense number (e.g. EXP-20261024-001)
     */
    public static function generateExpenseNumber(): string
    {
        $today = Carbon::now('Asia/Colombo')->format('Ymd');
        $prefix = "EXP-{$today}-";

        $lastExpense = self::where('expense_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastExpense) {
            $parts = explode('-', $lastExpense->expense_number);
            $seq = intval(end($parts)) + 1;
        } else {
            $seq = 1;
        }

        return $prefix . str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate business session date for 4:00 PM – 1:00 AM shift.
     * Orders or expenses between 12:00 AM and 4:00 AM belong to previous calendar day.
     */
    public static function calculateBusinessDate(?Carbon $dt = null): string
    {
        $time = $dt ? $dt->copy()->setTimezone('Asia/Colombo') : Carbon::now('Asia/Colombo');
        
        if ($time->hour < 4) {
            return $time->subDay()->toDateString();
        }

        return $time->toDateString();
    }
}
