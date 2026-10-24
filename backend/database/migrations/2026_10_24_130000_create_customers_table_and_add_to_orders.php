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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 30)->unique();
            $table->string('email', 100)->nullable();
            $table->unsignedInteger('loyalty_points')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0.00);
            $table->unsignedInteger('total_visits')->default(0);
            $table->enum('tier', ['bronze', 'silver', 'gold', 'vip'])->default('bronze');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['phone', 'tier']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('user_id')->constrained('customers')->nullOnDelete();
            $table->unsignedInteger('points_earned')->default(0)->after('change_due');
            $table->unsignedInteger('points_redeemed')->default(0)->after('points_earned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['customer_id', 'points_earned', 'points_redeemed']);
        });

        Schema::dropIfExists('customers');
    }
};
