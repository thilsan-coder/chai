<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Combo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tamil_name',
        'slug',
        'description',
        'regular_price',
        'combo_price',
        'savings_amount',
        'badge',
        'is_active',
        'is_featured',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'regular_price' => 'decimal:2',
        'combo_price' => 'decimal:2',
        'savings_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    /**
     * Items in the combo bundle.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ComboItem::class);
    }

    /**
     * Auto generate slug before creating.
     */
    protected static function booted()
    {
        static::creating(function ($combo) {
            if (empty($combo->slug)) {
                $combo->slug = Str::slug($combo->name) . '-' . rand(100, 999);
            }
            if (empty($combo->savings_amount)) {
                $combo->savings_amount = max(0, $combo->regular_price - $combo->combo_price);
            }
        });
    }
}
