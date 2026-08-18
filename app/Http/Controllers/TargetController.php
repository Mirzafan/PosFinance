<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\RevenueTarget;
use App\Models\Transaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TargetController extends Controller
{
    public function index(Request $request)
    {
        $bulan = (int) $request->input('month', Carbon::now()->month);
        $tahun = (int) $request->input('year', Carbon::now()->year);

        if ($bulan < 1 || $bulan > 12) {
            $bulan = Carbon::now()->month;
        }

        // Fetch categories & targets for selected month/year
        $categories = Category::orderBy('id', 'asc')->get();
        $targets = RevenueTarget::where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->get()
            ->keyBy('kategori_id');

        // Fetch approved transactions in selected month & year
        $startOfMonth = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
        $endOfMonth = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();

        $transactions = Transaction::where('status', 'approved')
            ->whereBetween('tanggal', [$startOfMonth->format('Y-m-d 00:00:00'), $endOfMonth->format('Y-m-d 23:59:59')])
            ->select(['id', 'kategori_id', 'nominal', 'nominal_ongkir'])
            ->get();

        $totalRegionalTarget = 0.0;
        $totalRegionalActual = 0.0;

        $categoryTargets = $categories->map(function ($category) use ($targets, $transactions, &$totalRegionalTarget, &$totalRegionalActual) {
            $catTargetModel = $targets->get($category->id);
            $targetNominal = $catTargetModel ? (float) $catTargetModel->target_nominal : 0.0;

            $catTransactions = $transactions->where('kategori_id', $category->id);
            $actualNominal = (float) $catTransactions->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $transactionCount = $catTransactions->count();

            $percentage = $targetNominal > 0 ? min(999.9, round(($actualNominal / $targetNominal) * 100, 1)) : 0.0;

            $status = 'perlu_ditingkatkan'; // red
            if ($percentage >= 100) {
                $status = 'tercapai'; // green
            } elseif ($percentage >= 75) {
                $status = 'hampir_tercapai'; // yellow
            }

            $totalRegionalTarget += $targetNominal;
            $totalRegionalActual += $actualNominal;

            return [
                'category_id' => $category->id,
                'category_name' => $category->nama_kategori,
                'target_nominal' => $targetNominal,
                'actual_nominal' => $actualNominal,
                'percentage' => $percentage,
                'status' => $status,
                'transaction_count' => $transactionCount,
                'keterangan' => $catTargetModel ? $catTargetModel->keterangan : '',
            ];
        });

        $regionalPercentage = $totalRegionalTarget > 0 
            ? min(999.9, round(($totalRegionalActual / $totalRegionalTarget) * 100, 1)) 
            : 0.0;

        $regionalStatus = 'perlu_ditingkatkan';
        if ($regionalPercentage >= 100) {
            $regionalStatus = 'tercapai';
        } elseif ($regionalPercentage >= 75) {
            $regionalStatus = 'hampir_tercapai';
        }

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        return Inertia::render('Targets/Index', [
            'categoryTargets' => $categoryTargets,
            'summary' => [
                'total_target' => $totalRegionalTarget,
                'total_actual' => $totalRegionalActual,
                'percentage' => $regionalPercentage,
                'status' => $regionalStatus,
                'tercapai_count' => $categoryTargets->where('status', 'tercapai')->count(),
                'hampir_tercapai_count' => $categoryTargets->where('status', 'hampir_tercapai')->count(),
                'perlu_ditingkatkan_count' => $categoryTargets->where('status', 'perlu_ditingkatkan')->count(),
            ],
            'filters' => [
                'month' => $bulan,
                'year' => $tahun,
                'month_name' => $monthNames[$bulan] ?? '',
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:categories,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2030',
            'target_nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $target = RevenueTarget::updateOrCreate(
            [
                'kategori_id' => $validated['kategori_id'],
                'bulan' => $validated['bulan'],
                'tahun' => $validated['tahun'],
            ],
            [
                'target_nominal' => $validated['target_nominal'],
                'keterangan' => $validated['keterangan'] ?? null,
            ]
        );

        $category = Category::find($validated['kategori_id']);
        $catName = $category ? $category->nama_kategori : 'Kategori';

        // Audit Log entry
        AuditLog::record(
            'SET_TARGET',
            'Revenue Target',
            "Pengaturan target pendapatan bulanan {$catName} sebesar Rp " . number_format($validated['target_nominal'], 0, ',', '.') . " untuk periode {$validated['bulan']}/{$validated['tahun']}.",
            $request->user()
        );

        return redirect()->back()->with('success', "Target pendapatan untuk {$catName} berhasil disimpan!");
    }

    public function reset(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mereset target pendapatan.');
        }

        $validated = $request->validate([
            'kategori_id' => 'required|exists:categories,id',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020|max:2030',
        ]);

        $category = Category::find($validated['kategori_id']);
        $catName = $category ? $category->nama_kategori : 'Kategori';

        RevenueTarget::where('kategori_id', $validated['kategori_id'])
            ->where('bulan', $validated['bulan'])
            ->where('tahun', $validated['tahun'])
            ->delete();

        AuditLog::record(
            'RESET_TARGET',
            'Revenue Target',
            "Mereset target pendapatan bulanan layanan {$catName} untuk periode {$validated['bulan']}/{$validated['tahun']}.",
            $request->user()
        );

        return redirect()->back()->with('success', "Target pendapatan untuk {$catName} berhasil direset!");
    }
}
