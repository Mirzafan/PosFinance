<?php

namespace App\Http\Controllers;

use App\Models\DailyClosing;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class DailyClosingController extends Controller
{
    public function index(Request $request)
    {
        $bulan = (int) $request->input('month', Carbon::now()->month);
        $tahun = (int) $request->input('year', Carbon::now()->year);

        if ($bulan < 1 || $bulan > 12) {
            $bulan = Carbon::now()->month;
        }

        if ($request->has('clear_all')) {
            Transaction::whereNotNull('closed_at')->update(['closed_at' => null]);
            DailyClosing::query()->delete();
            return redirect()->route('daily-closings.index')->with('success', 'Semua data riwayat kas berhasil direset/dihapus.');
        }

        // Automatic Sync: Find dates with closed_at or approved transactions in the past that aren't recorded in daily_closings
        $this->syncPastClosedTransactions($bulan, $tahun);

        $query = DailyClosing::with('user:id,name,role')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('catatan', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $rawClosings = $query->where('status_lock', true)->orderBy('tanggal', 'desc')->orderBy('closed_at', 'desc')->get();

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $totalKasTerkunci = (float) $rawClosings->sum('saldo_akhir');
        $totalClosingDays = $rawClosings->count();

        $kasStatus = self::getKasStatusData();

        $activityLogs = collect();

        foreach ($rawClosings as $c) {
            $tgl = $c->tanggal ? $c->tanggal->format('Y-m-d') : '';
            $formattedTgl = $c->tanggal ? $c->tanggal->isoFormat('D MMMM YYYY') : '';
            $dayName = $c->tanggal ? $c->tanggal->isoFormat('dddd') : '';

            $closeTimeStr = $c->closed_at
                ? $c->closed_at->setTimezone('Asia/Jakarta')->format('H.i') . ' WIB'
                : ($c->updated_at ? $c->updated_at->setTimezone('Asia/Jakarta')->format('H.i') . ' WIB' : '17.00 WIB');

            $closeTimestamp = $c->closed_at
                ? $c->closed_at->timestamp
                : ($c->updated_at ? $c->updated_at->timestamp : strtotime($tgl . ' 17:00:00'));

            $activityLogs->push([
                'id' => 'closing_' . $c->id,
                'closing_id' => $c->id,
                'tanggal' => $tgl,
                'formatted_tanggal' => $formattedTgl,
                'day_name' => $dayName,
                'formatted_time' => $closeTimeStr,
                'sort_timestamp' => $closeTimestamp,
                'log_type' => 'close',
                'log_title' => 'Penutupan Kas',
                'total_pemasukan' => (float) $c->total_pemasukan,
                'total_pengeluaran' => (float) $c->total_pengeluaran,
                'saldo_akhir' => (float) $c->saldo_akhir,
                'total_transaksi' => $c->total_transaksi,
                'user_id' => $c->user_id,
                'user_name' => $c->user ? $c->user->name : 'Admin Keuangan',
                'user_role' => 'Petugas Kasir / Admin',
                'status_lock' => true,
                'status_badge' => 'Terkunci 🔒',
                'catatan' => $c->catatan ?? 'Penutupan Kas Harian',
            ]);
        }

        // Sort activity logs descending by timestamp
        $sortedLogs = $activityLogs->sortByDesc('sort_timestamp')->values();

        return Inertia::render('DailyClosings/Index', [
            'closings' => $sortedLogs,
            'summary' => [
                'total_kas_terkunci' => $totalKasTerkunci,
                'total_closing_days' => $totalClosingDays,
                'today_closed' => $kasStatus['is_locked'],
                'today_closing_id' => $kasStatus['today_closing_id'],
                'today_date' => $kasStatus['today_date'],
                'today_raw_date' => $kasStatus['today_raw_date'],
                'is_outside_hours' => $kasStatus['is_outside_hours'],
                'kas_status' => $kasStatus,
            ],
            'filters' => [
                'month' => $bulan,
                'year' => $tahun,
                'month_name' => $monthNames[$bulan] ?? '',
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public static function getKasStatusData($targetDateStr = null)
    {
        $nowWib = Carbon::now('Asia/Jakarta');
        $todayDate = $nowWib->format('Y-m-d');
        $dateStr = $targetDateStr ? date('Y-m-d', strtotime($targetDateStr)) : $todayDate;

        $currentHour = (int) $nowWib->format('H');
        $isOutsideHours = ($dateStr === $todayDate) ? ($currentHour < 7 || $currentHour >= 17) : false;

        $closing = DailyClosing::whereDate('tanggal', $dateStr)->first();

        if ($closing) {
            if ($closing->status_lock) {
                return [
                    'status' => 'closed',
                    'mode' => 'manual_closed',
                    'is_locked' => true,
                    'label' => 'Kas Ditutup 🔒',
                    'description' => 'Kas harian telah ditutup.',
                    'today_closing_id' => $closing->id,
                    'is_outside_hours' => $isOutsideHours,
                    'today_date' => Carbon::parse($dateStr)->isoFormat('D MMMM YYYY'),
                    'today_raw_date' => $dateStr,
                ];
            } else {
                return [
                    'status' => 'open',
                    'mode' => 'emergency_open',
                    'is_locked' => false,
                    'label' => 'Kas Buka 🔓',
                    'description' => 'Kas harian sedang dibuka.',
                    'today_closing_id' => $closing->id,
                    'is_outside_hours' => $isOutsideHours,
                    'today_date' => Carbon::parse($dateStr)->isoFormat('D MMMM YYYY'),
                    'today_raw_date' => $dateStr,
                ];
            }
        }

        if ($isOutsideHours) {
            return [
                'status' => 'closed',
                'mode' => 'auto_closed',
                'is_locked' => true,
                'label' => 'Kas Ditutup 🔒',
                'description' => 'Jam operasional kasir: 07.00 - 17.00 WIB.',
                'today_closing_id' => null,
                'is_outside_hours' => true,
                'today_date' => Carbon::parse($dateStr)->isoFormat('D MMMM YYYY'),
                'today_raw_date' => $dateStr,
            ];
        }

        return [
            'status' => 'open',
            'mode' => 'auto_open',
            'is_locked' => false,
            'label' => 'Kas Buka 🔓',
            'description' => 'Kas harian aktif sesuai jam kerja kasir (07.00 - 17.00 WIB).',
            'today_closing_id' => null,
            'is_outside_hours' => false,
            'today_date' => Carbon::parse($dateStr)->isoFormat('D MMMM YYYY'),
            'today_raw_date' => $dateStr,
        ];
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang memiliki wewenang untuk melakukan Penutupan Kas Harian (Daily Closing).');
        }

        $validated = $request->validate([
            'tanggal' => 'required|date',
            'catatan' => 'nullable|string|max:500',
        ]);

        $dateStr = date('Y-m-d', strtotime($validated['tanggal']));

        $transactions = Transaction::whereDate('tanggal', $dateStr)
            ->where('status', 'approved')
            ->get();

        if ($transactions->isEmpty()) {
            $totalOngkir = 0;
            $totalAsuransi = 0;
            $saldoAkhir = 0;
            $totalTrx = 0;
        } else {
            $totalOngkir = (float) $transactions->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
            $saldoAkhir = $totalOngkir - $totalAsuransi;
            $totalTrx = $transactions->count();
        }

        $now = now();

        DB::transaction(function () use ($dateStr, $transactions, $totalOngkir, $totalAsuransi, $saldoAkhir, $totalTrx, $validated, $request, $now) {
            // Update transactions to locked closed_at if any
            if ($transactions->count() > 0) {
                Transaction::whereDate('tanggal', $dateStr)->update([
                    'status' => 'approved',
                    'closed_at' => $now,
                ]);
            }

            // Save DailyClosing record
            DailyClosing::updateOrCreate(
                ['tanggal' => $dateStr],
                [
                    'total_pemasukan' => $totalOngkir,
                    'total_pengeluaran' => $totalAsuransi,
                    'saldo_akhir' => $saldoAkhir,
                    'total_transaksi' => $totalTrx,
                    'user_id' => $request->user()->id,
                    'status_lock' => true,
                    'catatan' => $validated['catatan'] ?? 'Penutupan Kas Harian (Closing Manual / Darurat)',
                    'closed_at' => $now,
                ]
            );

            // Record Audit Log
            AuditLog::record(
                'DAILY_CLOSING',
                'Penutupan Kas',
                "Melakukan Penutupan Kas Harian ({$dateStr}) total setoran netto Rp " . number_format($saldoAkhir, 0, ',', '.') . " ({$totalTrx} transaksi)",
                $request->user()
            );
        });

        return redirect()->back()->with('success', "Penutupan Kas Harian (Daily Closing) untuk tanggal " . date('d/m/Y', strtotime($dateStr)) . " berhasil diproses dan dikunci 🔒.");
    }

    public function emergencyOpen(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang memiliki wewenang untuk Buka Kas Darurat (Emergency Unlock).');
        }

        $dateStr = $request->input('tanggal', Carbon::now('Asia/Jakarta')->format('Y-m-d'));

        DB::transaction(function () use ($dateStr, $request) {
            // Unlock transactions on this date if any
            Transaction::whereDate('tanggal', $dateStr)->update([
                'closed_at' => null,
            ]);

            $closing = DailyClosing::whereDate('tanggal', $dateStr)->first();

            if ($closing) {
                $closing->update([
                    'status_lock' => false,
                    'catatan' => 'Mode Buka Kas Darurat (Emergency Override) oleh Admin',
                ]);
            } else {
                DailyClosing::create([
                    'tanggal' => $dateStr,
                    'total_pemasukan' => 0,
                    'total_pengeluaran' => 0,
                    'saldo_akhir' => 0,
                    'total_transaksi' => 0,
                    'user_id' => $request->user()->id,
                    'status_lock' => false,
                    'catatan' => 'Mode Buka Kas Darurat (Emergency Override) oleh Admin',
                    'closed_at' => null,
                ]);
            }

            AuditLog::record(
                'EMERGENCY_UNLOCK',
                'Penutupan Kas',
                "Membuka Kas Harian ({$dateStr}) dalam Mode Buka Darurat (Emergency Unlock)",
                $request->user()
            );
        });

        return redirect()->back()->with('success', "Kas Harian tanggal " . date('d/m/Y', strtotime($dateStr)) . " berhasil dibuka dalam Mode Buka Darurat (Emergency Override) 🔓. Transaksi kini dapat dicatat.");
    }

    public function exportPdf($id)
    {
        $closing = DailyClosing::with('user:id,name,role')->findOrFail($id);

        $dateStr = $closing->tanggal->format('Y-m-d');

        $transactions = Transaction::with('category')
            ->whereDate('tanggal', $dateStr)
            ->where('status', 'approved')
            ->get();

        $categories = Category::orderBy('nama_kategori')->get();
        $categoryBreakdown = $categories->map(function ($cat) use ($transactions) {
            $catTrx = $transactions->where('kategori_id', $cat->id);
            $ongkir = (float) $catTrx->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $asuransi = (float) $catTrx->sum('nominal_asuransi');
            return [
                'nama_kategori' => $cat->nama_kategori,
                'count' => $catTrx->count(),
                'total_ongkir' => $ongkir,
                'total_asuransi' => $asuransi,
                'net_revenue' => $ongkir - $asuransi,
            ];
        })->filter(function ($item) {
            return $item['count'] > 0;
        })->values();

        $pdfData = [
            'closing' => [
                'id' => $closing->id,
                'tanggal' => $closing->tanggal->format('Y-m-d'),
                'total_pemasukan' => (float) $closing->total_pemasukan,
                'total_pengeluaran' => (float) $closing->total_pengeluaran,
                'saldo_akhir' => (float) $closing->saldo_akhir,
                'total_transaksi' => $closing->total_transaksi,
                'user_name' => $closing->user ? $closing->user->name : 'Kasir/Staff Keuangan',
                'closed_at' => $closing->closed_at ? $closing->closed_at->format('Y-m-d H:i:s') : '',
            ],
            'category_breakdown' => $categoryBreakdown,
            'printed_at' => Carbon::now()->format('d-m-Y H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.daily_closing_receipt', $pdfData);

        return $pdf->download('berita-acara-closing-' . $dateStr . '.pdf');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang memiliki wewenang untuk membuka kunci Daily Closing.');
        }

        $closing = DailyClosing::findOrFail($id);
        $dateStr = $closing->tanggal->format('Y-m-d');
        $nowWib = Carbon::now('Asia/Jakarta');
        $todayDate = $nowWib->format('Y-m-d');
        $currentHour = (int) $nowWib->format('H');
        $isOutsideHours = ($currentHour < 7 || $currentHour >= 17);

        DB::transaction(function () use ($closing, $dateStr, $todayDate, $isOutsideHours, $request) {
            // Unlock transactions for this date
            Transaction::whereDate('tanggal', $dateStr)->update([
                'closed_at' => null,
            ]);

            // Audit log
            AuditLog::record(
                'UNLOCK_CLOSING',
                'Penutupan Kas',
                "Membuka Kunci Kas Harian (Reopen Closing) tanggal " . date('d/m/Y', strtotime($dateStr)),
                $request->user()
            );

            if ($dateStr === $todayDate && $isOutsideHours) {
                // If unlocking today outside hours, set status_lock = false so it enters Emergency Open mode instead of auto_closed
                $closing->update([
                    'status_lock' => false,
                    'catatan' => 'Mode Buka Kas Darurat (Emergency Override) oleh Admin',
                ]);
            } else {
                $closing->delete();
            }
        });

        return redirect()->back()->with('success', "Kunci Penutupan Kas tanggal " . date('d/m/Y', strtotime($dateStr)) . " berhasil dibuka 🔓. Transaksi pada tanggal tersebut kini dapat ditambahkan/diubah kembali.");
    }

    public function clearLogs(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mereset data riwayat kas.');
        }

        Transaction::whereNotNull('closed_at')->update(['closed_at' => null]);
        DailyClosing::query()->delete();

        AuditLog::record('CLEAR_LOGS', 'Penutupan Kas', 'Admin mereset seluruh data riwayat penutupan kas', $request->user());

        return redirect()->back()->with('success', 'Semua data riwayat kas berhasil dihapus/direset.');
    }

    private function syncPastClosedTransactions($bulan, $tahun)
    {
        $existingDates = DailyClosing::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->pluck('tanggal')
            ->map(fn($d) => date('Y-m-d', strtotime($d)))
            ->toArray();

        $datesWithClosedTrx = Transaction::whereNotNull('closed_at')
            ->whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->select(DB::raw('DATE(tanggal) as tgl'))
            ->groupBy(DB::raw('DATE(tanggal)'))
            ->pluck('tgl');

        foreach ($datesWithClosedTrx as $dateStr) {
            if (!in_array($dateStr, $existingDates)) {
                $trxs = Transaction::whereDate('tanggal', $dateStr)->where('status', 'approved')->get();
                if ($trxs->count() > 0) {
                    $ongkir = (float) $trxs->sum(function ($t) {
                        return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
                    });
                    $asuransi = (float) $trxs->sum('nominal_asuransi');
                    $saldo = $ongkir - $asuransi;

                    DailyClosing::create([
                        'tanggal' => $dateStr,
                        'total_pemasukan' => $ongkir,
                        'total_pengeluaran' => $asuransi,
                        'saldo_akhir' => $saldo,
                        'total_transaksi' => $trxs->count(),
                        'user_id' => auth()->id(),
                        'status_lock' => true,
                        'catatan' => 'Penutupan kas otomatis dari transaksi terdahulu',
                        'closed_at' => $trxs->first()->closed_at ?? now(),
                    ]);
                }
            }
        }
    }
}
