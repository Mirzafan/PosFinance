<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ServiceLeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'monthly'); // today, weekly, monthly, yearly, all
        $sortBy = $request->input('sort_by', 'revenue'); // revenue, volume

        $now = Carbon::now('Asia/Jakarta');

        $query = Transaction::where('status', 'approved');

        if ($period === 'today') {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('tanggal', [$now->copy()->startOfWeek()->format('Y-m-d 00:00:00'), $now->copy()->endOfWeek()->format('Y-m-d 23:59:59')]);
        } elseif ($period === 'monthly') {
            $query->whereMonth('tanggal', $now->month)->whereYear('tanggal', $now->year);
        } elseif ($period === 'yearly') {
            $query->whereYear('tanggal', $now->year);
        }

        $approvedTransactions = $query->select(['id', 'kategori_id', 'nominal', 'nominal_ongkir', 'nominal_asuransi'])->get();

        $totalSystemRevenue = (float) $approvedTransactions->sum(function ($t) {
            return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
        });

        $categories = Category::all();

        $leaderboardData = $categories->map(function ($category) use ($approvedTransactions, $totalSystemRevenue) {
            $catTrx = $approvedTransactions->where('kategori_id', $category->id);
            
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
        });

        if ($sortBy === 'volume') {
            $sortedLeaderboard = $leaderboardData->sortByDesc('package_count')->values();
        } else {
            $sortedLeaderboard = $leaderboardData->sortByDesc('total_ongkir')->values();
        }

        // Add rank index and badges
        $rankedLeaderboard = $sortedLeaderboard->map(function ($item, $index) {
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

        $topCategory = $rankedLeaderboard->first();

        return Inertia::render('ServiceLeaderboard/Index', [
            'leaderboard' => $rankedLeaderboard,
            'topCategory' => $topCategory,
            'summary' => [
                'total_system_revenue' => $totalSystemRevenue,
                'total_system_packages' => $approvedTransactions->count(),
                'total_categories' => $categories->count(),
            ],
            'filters' => [
                'period' => $period,
                'sort_by' => $sortBy,
            ],
        ]);
    }
}
