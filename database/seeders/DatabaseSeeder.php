<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Clear existing records to allow clean re-seeding
        Transaction::query()->delete();
        Category::query()->delete();
        Branch::query()->delete();
        User::query()->delete();

        // Seed Users
        User::create([
            'name' => 'Admin Keuangan',
            'email' => 'admin@posfinance.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Staff Keuangan',
            'email' => 'staff@posfinance.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        User::create([
            'name' => 'Supervisor Keuangan',
            'email' => 'supervisor@posfinance.com',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
        ]);

        // Seed Branches (Single Dedicated Regional Branch)
        $branch = Branch::create(['nama_cabang' => 'Pos Indonesia Kantor Regional IV Semarang']);

        // Seed Categories
        $categoriesData = [
            'PosPay',
            'Giropos',
            'Wesel Pos',
            'Logistik',
            'Operasional',
            'Administrasi'
        ];

        $categories = [];
        foreach ($categoriesData as $catName) {
            $cat = Category::create(['nama_kategori' => $catName]);
            $categories[$catName] = $cat->id;
        }

        // Dummy Transactions removed to keep transactions table empty by default
    }
}

