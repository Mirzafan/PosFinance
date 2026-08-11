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
            $table->index(['status', 'tanggal']);
            $table->index(['kategori_id', 'status']);
            $table->index(['tanggal', 'closed_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('module');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['status', 'tanggal']);
            $table->dropIndex(['kategori_id', 'status']);
            $table->dropIndex(['tanggal', 'closed_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['module']);
            $table->dropIndex(['created_at']);
        });
    }
};
