<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $staff = User::where('role', 'staff')->first();

        if (AuditLog::count() === 0) {
            AuditLog::create([
                'user_id' => $staff ? $staff->id : null,
                'user_name' => $staff ? $staff->name : 'Staff Keuangan',
                'user_role' => 'staff',
                'action' => 'CREATE',
                'module' => 'Transaksi',
                'description' => 'Mencatat transaksi pengeluaran baru (TRX-20260730-02B5) nominal Rp 600.000',
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subMinutes(45),
            ]);

            AuditLog::create([
                'user_id' => $admin ? $admin->id : null,
                'user_name' => $admin ? $admin->name : 'Admin Utama',
                'user_role' => 'admin',
                'action' => 'APPROVE',
                'module' => 'Transaksi',
                'description' => 'Menyetujui (Approve) transaksi (TRX-20260730-02B5) nominal Rp 600.000',
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subMinutes(30),
            ]);

            AuditLog::create([
                'user_id' => $admin ? $admin->id : null,
                'user_name' => $admin ? $admin->name : 'Admin Utama',
                'user_role' => 'admin',
                'action' => 'CREATE',
                'module' => 'Kategori',
                'description' => 'Menambahkan kategori transaksi baru: Logistik & Operasional',
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subMinutes(20),
            ]);

            AuditLog::create([
                'user_id' => $admin ? $admin->id : null,
                'user_name' => $admin ? $admin->name : 'Admin Utama',
                'user_role' => 'admin',
                'action' => 'UPDATE',
                'module' => 'User',
                'description' => 'Memperbarui data akun pengguna Budi Santoso (budi@posindonesia.co.id) [Role: STAFF]',
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subMinutes(10),
            ]);
        }
    }
}
