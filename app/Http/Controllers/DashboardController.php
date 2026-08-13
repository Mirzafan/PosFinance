<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Services\ForecastingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request, ForecastingService $forecastingService)
    {
        $period = $request->input('period', 'daily'); // daily, weekly, monthly, all
        $forecastHorizon = (int) $request->input('forecast_days', 14);
        if (!in_array($forecastHorizon, [7, 14, 30])) {
            $forecastHorizon = 14;
        }

        $query = Transaction::where('status', 'approved');

        if ($period === 'daily') {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek()->format('Y-m-d 00:00:00'), Carbon::now()->endOfWeek()->format('Y-m-d 23:59:59')]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('tanggal', Carbon::now()->month)->whereYear('tanggal', Carbon::now()->year);
        }

        $transactions = $query->select(['id', 'tanggal', 'nominal', 'nominal_ongkir', 'nominal_asuransi', 'kategori_id'])->get();

        $totalOngkir = (float) $transactions->sum(function ($t) {
            return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
        });

        $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
        $netRevenue = $totalOngkir - $totalAsuransi;
        $totalTransaksi = $transactions->count();

        // Check today's closing status using optimized queries
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
            ->whereBetween('tanggal', [$startOfMonth->format('Y-m-d 00:00:00'), $endOfMonth->format('Y-m-d 23:59:59')])
            ->select(['id', 'tanggal', 'nominal', 'nominal_ongkir', 'nominal_asuransi'])
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
            ->select(['id', 'tanggal', 'nominal', 'nominal_ongkir', 'nominal_asuransi'])
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

        // 4. Yearly Trends (Last 5 Years)
        $startYear = ((int) $currentYear) - 4;
        $yearlyTrendsMap = [];
        for ($y = $startYear; $y <= (int) $currentYear; $y++) {
            $yKey = (string) $y;
            $yearlyTrendsMap[$yKey] = [
                'label' => "Th {$y}",
                'key' => $yKey,
                'ongkir' => 0,
                'asuransi' => 0,
                'net' => 0,
            ];
        }

        $allApprovedTrx = Transaction::where('status', 'approved')
            ->select(['id', 'tanggal', 'nominal', 'nominal_ongkir', 'nominal_asuransi'])
            ->get();

        foreach ($allApprovedTrx as $t) {
            $yStr = Carbon::parse($t->tanggal)->format('Y');
            if (isset($yearlyTrendsMap[$yStr])) {
                $ongkirVal = (float) ($t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal);
                $asuransiVal = (float) ($t->nominal_asuransi ?? 0);
                $yearlyTrendsMap[$yStr]['ongkir'] += $ongkirVal;
                $yearlyTrendsMap[$yStr]['asuransi'] += $asuransiVal;
                $yearlyTrendsMap[$yStr]['net'] += ($ongkirVal - $asuransiVal);
            }
        }
        $yearlyTrends = array_values($yearlyTrendsMap);

        // 5. All-Time Trends (Grouped by Month/Year)
        $allTimeMap = [];
        foreach ($allApprovedTrx as $t) {
            $ymKey = Carbon::parse($t->tanggal)->format('M y');
            if (!isset($allTimeMap[$ymKey])) {
                $allTimeMap[$ymKey] = [
                    'label' => $ymKey,
                    'key' => $ymKey,
                    'ongkir' => 0,
                    'asuransi' => 0,
                    'net' => 0,
                ];
            }
            $ongkirVal = (float) ($t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal);
            $asuransiVal = (float) ($t->nominal_asuransi ?? 0);
            $allTimeMap[$ymKey]['ongkir'] += $ongkirVal;
            $allTimeMap[$ymKey]['asuransi'] += $asuransiVal;
            $allTimeMap[$ymKey]['net'] += ($ongkirVal - $asuransiVal);
        }
        $allTimeTrends = array_values($allTimeMap);
        if (empty($allTimeTrends)) {
            $allTimeTrends = $monthlyTrends;
        }

        // Product Breakdown Chart & Table Data (Filtered by active period)
        $categories = Category::select(['id', 'nama_kategori'])->get();
        $productBreakdown = $categories->map(function ($category) use ($transactions) {
            $catTransactions = $transactions->where('kategori_id', $category->id);
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
        })->values()->toArray();

        // Service Leaderboard calculation
        $totalSystemRevenue = $totalOngkir;
        $leaderboardData = $categories->map(function ($category) use ($transactions, $totalSystemRevenue) {
            $catTrx = $transactions->where('kategori_id', $category->id);
            $totalOngkir = (float) $catTrx->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $totalAsuransi = (float) $catTrx->sum('nominal_asuransi');
            $netRevenue = $totalOngkir - $totalAsuransi;
            $count = $catTrx->count();
            $avgPerPaket = $count > 0 ? round($totalOngkir / $count) : 0;
            $marketShare = $totalSystemRevenue > 0 ? round(($totalOngkir / $totalSystemRevenue) * 100, 1) : 0;

            return [
                'id' => $category->id,
                'name' => $category->nama_kategori,
                'total_ongkir' => $totalOngkir,
                'total_asuransi' => $totalAsuransi,
                'net_revenue' => $netRevenue,
                'package_count' => $count,
                'avg_per_paket' => $avgPerPaket,
                'market_share' => $marketShare,
            ];
        })->sortByDesc('total_ongkir')->values();

        $rankedLeaderboard = $leaderboardData->map(function ($item, $index) {
            $item['rank'] = $index + 1;
            if ($index === 0) {
                $item['badge'] = '🥇 Juara 1 (Gold Performer)';
                $item['rank_color'] = 'amber';
            } elseif ($index === 1) {
                $item['badge'] = '🥈 Juara 2 (Silver Performer)';
                $item['rank_color'] = 'slate';
            } elseif ($index === 2) {
                $item['badge'] = '🥉 Juara 3 (Bronze Performer)';
                $item['rank_color'] = 'orange';
            } else {
                $item['badge'] = 'Peringkat ' . ($index + 1);
                $item['rank_color'] = 'blue';
            }
            return $item;
        });

        // 5 Recent Transactions
        $recentTransactions = Transaction::with(['category:id,nama_kategori', 'user:id,name'])
            ->select(['id', 'nomor_transaksi', 'tanggal', 'jenis_transaksi', 'kategori_id', 'user_id', 'nominal', 'nominal_ongkir', 'nominal_asuransi', 'status'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        // Generate ML Time Series Forecast
        $forecastingData = $forecastingService->generateForecast($forecastHorizon);

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'charts' => [
                'daily_trends' => $dailyTrends,
                'weekly_trends' => $weeklyTrends,
                'monthly_trends' => $monthlyTrends,
                'yearly_trends' => $yearlyTrends,
                'all_time_trends' => $allTimeTrends,
                'category_breakdown' => array_values($productBreakdown),
            ],
            'productBreakdown' => array_values($productBreakdown),
            'serviceLeaderboard' => $rankedLeaderboard,
            'recentTransactions' => $recentTransactions,
            'forecasting' => $forecastingData,
            'filters' => [
                'period' => $period,
                'forecast_days' => $forecastHorizon,
            ],
        ]);
    }
}

