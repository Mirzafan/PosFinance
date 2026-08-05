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
        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('nominal_ongkir', 15, 2)->default(0)->after('nominal');
            $table->decimal('nominal_asuransi', 15, 2)->default(0)->after('nominal_ongkir');
            $table->timestamp('closed_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['nominal_ongkir', 'nominal_asuransi', 'closed_at']);
        });
    }
};
