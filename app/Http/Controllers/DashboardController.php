<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'all'); // daily, weekly, monthly, all

        $query = Transaction::where('status', 'approved');

        if ($period === 'daily') {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('tanggal', Carbon::now()->month)->whereYear('tanggal', Carbon::now()->year);
        }

        $transactions = $query->get();

        $totalOngkir = (float) $transactions->sum(function ($t) {
            return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
        });

        $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
        $netRevenue = $totalOngkir - $totalAsuransi;
        $totalTransaksi = $transactions->count();

        // Check today's closing status
        $todayCount = Transaction::whereDate('tanggal', Carbon::today())->count();
        $todayClosedCount = Transaction::whereDate('tanggal', Carbon::today())->whereNotNull('closed_at')->count();
        $isTodayClosed = $todayCount > 0 && $todayCount === $todayClosedCount;

        $summary = [
            'period' => $period,
            'total_ongkir' => $totalOngkir,
            'total_asuransi' => $totalAsuransi,
            'net_revenue' => $netRevenue,
            'total_transaksi' => $totalTransaksi,
            'today_count' => $todayCount,
            'today_closed_count' => $todayClosedCount,
            'is_today_closed' => $isTodayClosed,
        ];

        // =========================================================================
        // TREND CHARTS: HARIAN (DAILY), MINGGUAN (WEEKLY), & BULANAN (MONTHLY)
        // =========================================================================
        
        // 1. Daily Trends (Days of current month: 1..31)
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $daysInMonth = Carbon::now()->daysInMonth;

        $dailyTrx = Transaction::where('status', 'approved')
            ->whereBetween('tanggal', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
            ->get();

        $dailyTrendsMap = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dayKey = str_pad($d, 2, '0', STR_PAD_LEFT);
            $dailyTrendsMap[$dayKey] = [
                'label' => "Tgl {$d}",
                'key' => $dayKey,
                'ongkir' => 0,
                'asuransi' => 0,
                'net' => 0,
            ];
        }

        foreach ($dailyTrx as $t) {
            $dayStr = Carbon::parse($t->tanggal)->format('d');
            if (isset($dailyTrendsMap[$dayStr])) {
                $ongkirVal = (float) ($t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal);
                $asuransiVal = (float) ($t->nominal_asuransi ?? 0);
                $dailyTrendsMap[$dayStr]['ongkir'] += $ongkirVal;
                $dailyTrendsMap[$dayStr]['asuransi'] += $asuransiVal;
                $dailyTrendsMap[$dayStr]['net'] += ($ongkirVal - $asuransiVal);
            }
        }
        $dailyTrends = array_values($dailyTrendsMap);

        // 2. Weekly Trends (Weeks of current month: Minggu 1 to Minggu 5)
        $weeklyTrendsMap = [];
        for ($w = 1; $w <= 5; $w++) {
            $weeklyTrendsMap["W{$w}"] = [
                'label' => "Minggu {$w}",
                'key' => "W{$w}",
                'ongkir' => 0,
                'asuransi' => 0,
                'net' => 0,
            ];
        }

        foreach ($dailyTrx as $t) {
            $dayNum = (int) Carbon::parse($t->tanggal)->format('d');
            $weekNum = min(5, (int) ceil($dayNum / 7));
            $wKey = "W{$weekNum}";
            if (isset($weeklyTrendsMap[$wKey])) {
                $ongkirVal = (float) ($t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal);
                $asuransiVal = (float) ($t->nominal_asuransi ?? 0);
                $weeklyTrendsMap[$wKey]['ongkir'] += $ongkirVal;
                $weeklyTrendsMap[$wKey]['asuransi'] += $asuransiVal;
                $weeklyTrendsMap[$wKey]['net'] += ($ongkirVal - $asuransiVal);
            }
        }
        $weeklyTrends = array_values($weeklyTrendsMap);

        // 3. Monthly Trends (Jan - Des of current year)
        $currentYear = date('Y');
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        $yearlyTrx = Transaction::where('status', 'approved')
            ->whereYear('tanggal', $currentYear)
            ->get();

        $monthlyTrendsMap = [];
        for ($m = 1; $m <= 12; $m++) {
            $mKey = str_pad($m, 2, '0', STR_PAD_LEFT);
            $monthlyTrendsMap[$mKey] = [
                'label' => $monthNames[$m],
                'key' => $mKey,
                'ongkir' => 0,
                'asuransi' => 0,
                'net' => 0,
            ];
        }

        foreach ($yearlyTrx as $t) {
            $mStr = Carbon::parse($t->tanggal)->format('m');
            if (isset($monthlyTrendsMap[$mStr])) {
                $ongkirVal = (float) ($t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal);
                $asuransiVal = (float) ($t->nominal_asuransi ?? 0);
                $monthlyTrendsMap[$mStr]['ongkir'] += $ongkirVal;
                $monthlyTrendsMap[$mStr]['asuransi'] += $asuransiVal;
                $monthlyTrendsMap[$mStr]['net'] += ($ongkirVal - $asuransiVal);
            }
        }
        $monthlyTrends = array_values($monthlyTrendsMap);

        // Product Breakdown Chart & Table Data
        $categories = Category::all();
        $productBreakdown = $categories->map(function ($category) {
            $catTransactions = Transaction::where('kategori_id', $category->id)->where('status', 'approved')->get();
            $ongkir = (float) $catTransactions->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $asuransi = (float) $catTransactions->sum('nominal_asuransi');
            $net = $ongkir - $asuransi;
            $count = $catTransactions->count();

            return [
                'id' => $category->id,
                'name' => $category->nama_kategori,
                'total_ongkir' => $ongkir,
                'total_asuransi' => $asuransi,
                'net_revenue' => $net,
                'count' => $count,
                'value' => $ongkir,
            ];
        })->toArray();

        // 5 Recent Transactions
        $recentTransactions = Transaction::with(['category', 'user'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'charts' => [
                'daily_trends' => $dailyTrends,
                'weekly_trends' => $weeklyTrends,
                'monthly_trends' => $monthlyTrends,
                'category_breakdown' => array_values($productBreakdown),
            ],
            'productBreakdown' => array_values($productBreakdown),
            'recentTransactions' => $recentTransactions,
            'filters' => [
                'period' => $period,
            ],
        ]);
    }
}
