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
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 15)->unique(); // e.g. T-01, SW-01
            $table->unsignedInteger('capacity')->default(4);
            $table->enum('floor_section', ['indoor_ground', 'outdoor_verandah', 'balcony_swing', 'ac_family'])->default('indoor_ground');
            $table->enum('status', ['available', 'occupied', 'reserved', 'cleaning'])->default('available');
            $table->foreignId('current_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['floor_section', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
