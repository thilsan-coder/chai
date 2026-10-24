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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_number', 30)->unique();
            $table->string('category', 50)->index(); // gas_cylinder, utilities, market_produce, packaging, maintenance, staff_welfare, rent_rates, cleaning_misc
            $table->string('title', 150);
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 30)->default('cash'); // cash, petty_cash, bank_transfer, card
            $table->string('paid_to', 100)->nullable();
            $table->string('receipt_number', 50)->nullable();
            $table->date('expense_date');
            $table->date('business_date')->index(); // 4:00 PM - 1:00 AM Sri Lankan session
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
