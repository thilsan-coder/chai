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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('bank_name', 50)->nullable()->after('payment_method');
            $table->string('bank_reference', 100)->nullable()->after('bank_name');
            $table->string('verification_status', 30)->default('verified')->after('bank_reference'); // verified, pending_verification, rejected
            $table->foreignId('verified_by')->nullable()->after('verification_status')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->text('verification_notes')->nullable()->after('verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn([
                'bank_name',
                'bank_reference',
                'verification_status',
                'verified_by',
                'verified_at',
                'verification_notes',
            ]);
        });
    }
};
