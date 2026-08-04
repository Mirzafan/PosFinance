<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = date('Y');

        // Summary Calculations (Approved transactions only)
        $totalPemasukan = (float) Transaction::where('status', 'approved')->sum('nominal');
        $totalPengeluaran = 0;
        $saldo = $totalPemasukan;
        $totalTransaksi = Transaction::where('status', 'approved')->count();

        $summary = [
            'total_pemasukan' => $totalPemasukan,
            'total_pengeluaran' => 0,
            'saldo' => $saldo,
            'total_transaksi' => $totalTransaksi,
        ];

        // Monthly Trends Chart Data (Approved transactions)
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $driver = DB::getDriverName();
        $monthSql = $driver === 'sqlite' ? "STRFTIME('%m', tanggal)" : "DATE_FORMAT(tanggal, '%m')";

        $rawMonthlyData = Transaction::select(
            DB::raw("{$monthSql} as month_num"),
            DB::raw('SUM(nominal) as total')
        )
        ->where('status', 'approved')
        ->whereYear('tanggal', $currentYear)
        ->groupBy('month_num')
        ->get();

        $monthlyTrendsMap = [];
        for ($m = 1; $m <= 12; $m++) {
            $key = str_pad($m, 2, '0', STR_PAD_LEFT);
            $monthlyTrendsMap[$key] = [
                'label' => $monthNames[$m],
                'month_key' => $key,
                'pemasukan' => 0,
                'pengeluaran' => 0,
                'net' => 0,
            ];
        }

        foreach ($rawMonthlyData as $row) {
            $mKey = str_pad((int)$row->month_num, 2, '0', STR_PAD_LEFT);
            if (isset($monthlyTrendsMap[$mKey])) {
                $monthlyTrendsMap[$mKey]['pemasukan'] = (float) $row->total;
                $monthlyTrendsMap[$mKey]['net'] = (float) $row->total;
            }
        }

        $monthlyTrends = array_values($monthlyTrendsMap);

        // Category Breakdown Chart Data (Approved transactions)
        $categoryBreakdown = Transaction::select(
            'kategori_id',
            DB::raw('SUM(nominal) as value')
        )
        ->where('status', 'approved')
        ->with('category')
        ->groupBy('kategori_id')
        ->get()
        ->map(function ($item) {
            return [
                'name' => $item->category ? $item->category->nama_kategori : 'Lainnya',
                'value' => (float) $item->value,
                'jenis_transaksi' => 'campuran'
            ];
        })
        ->toArray();

        // 5 Recent Transactions (Show recent transactions with status)
        $recentTransactions = Transaction::with('category')
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'charts' => [
                'monthly_trends' => $monthlyTrends,
                'category_breakdown' => array_values($categoryBreakdown),
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
