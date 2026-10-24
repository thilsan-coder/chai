<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'loyalty_points',
        'total_spent',
        'total_visits',
        'tier',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'loyalty_points' => 'integer',
        'total_spent' => 'float',
        'total_visits' => 'integer',
        'is_active' => 'boolean',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class)->latest('id');
    }

    /**
     * Recalculate customer tier based on spend & visits.
     */
    public function recalculateTier(): void
    {
        if ($this->total_spent >= 25000 || $this->total_visits >= 50) {
            $this->tier = 'vip';
        } elseif ($this->total_spent >= 10000 || $this->total_visits >= 20) {
            $this->tier = 'gold';
        } elseif ($this->total_spent >= 3000 || $this->total_visits >= 5) {
            $this->tier = 'silver';
        } else {
            $this->tier = 'bronze';
        }
        $this->save();
    }
}
