<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'base_price',
        'cost_price',
        'image_url',
        'is_available',
        'is_featured',
        'preparation_time_minutes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'float',
            'cost_price' => 'float',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'preparation_time_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order', 'asc');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(ProductAddon::class);
    }
}
