<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 30);
            $table->string('email', 100)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('supplied_categories', 150)->nullable(); // e.g. "Dairy, Milk", "Tea Leaves"
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 30)->unique(); // e.g. RAW-MILK-01
            $table->enum('category', ['dairy', 'tea_spices', 'bakery_meats', 'packaging', 'beverages', 'syrups_extras'])->default('tea_spices');
            $table->string('unit', 20); // l, ml, kg, g, pcs, packet, bottle
            $table->decimal('current_stock', 12, 3)->default(0.000);
            $table->decimal('min_stock_alert', 12, 3)->default(10.000);
            $table->decimal('cost_per_unit', 10, 2)->default(0.00); // LKR
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'current_stock']);
        });

        Schema::create('product_recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->decimal('quantity_required', 10, 3); // e.g. 0.150 (liters of milk)
            $table->timestamps();

            $table->unique(['product_id', 'variant_id', 'inventory_item_id'], 'recipe_unique_item');
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->enum('movement_type', ['purchase_in', 'order_consumption', 'waste_spoilage', 'adjustment'])->default('purchase_in');
            $table->decimal('quantity', 12, 3); // positive for in, negative or positive handled
            $table->decimal('balance_after', 12, 3);
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->string('reference', 100)->nullable(); // e.g. "Invoice #INV-204" or "Order #101"
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['inventory_item_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('product_recipes');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('suppliers');
    }
};
