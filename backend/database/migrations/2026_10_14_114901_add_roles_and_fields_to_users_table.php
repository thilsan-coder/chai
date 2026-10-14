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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('cashier')->after('email'); // owner, manager, cashier, kitchen, stock_manager
            $table->string('phone')->nullable()->after('role');
            $table->string('pin_code', 10)->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('pin_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'pin_code', 'is_active']);
        });
    }
};
