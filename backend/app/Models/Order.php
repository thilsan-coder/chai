<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'token_number',
        'order_type',
        'table_number',
        'customer_name',
        'customer_phone',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'discount',
        'tax',
        'total',
        'amount_tendered',
        'change_due',
        'points_earned',
        'points_redeemed',
        'notes',
        'user_id',
        'customer_id',
    ];

    protected $casts = [
        'token_number' => 'integer',
        'subtotal' => 'float',
        'discount' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'amount_tendered' => 'float',
        'change_due' => 'float',
        'points_earned' => 'integer',
        'points_redeemed' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Generate next daily token number (starts at 101 each day).
     */
    public static function generateTokenNumber(): int
    {
        $todayStart = Carbon::today('Asia/Colombo')->startOfDay();
        $lastToken = self::where('created_at', '>=', $todayStart)->max('token_number');

        return $lastToken ? ((int) $lastToken + 1) : 101;
    }

    /**
     * Generate unique Order Number like ORD-20261024-0001
     */
    public static function generateOrderNumber(): string
    {
        $datePrefix = Carbon::now('Asia/Colombo')->format('Ymd');
        $todayStart = Carbon::today('Asia/Colombo')->startOfDay();
        $todayCount = self::where('created_at', '>=', $todayStart)->count() + 1;

        return sprintf('ORD-%s-%04d', $datePrefix, $todayCount);
    }
}
