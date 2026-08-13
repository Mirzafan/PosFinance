<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Branch;
use App\Models\AuditLog;
use App\Models\DailyClosing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'branch']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nomor_transaksi', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('tanggal', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('tanggal', '<=', $request->input('end_date'));
        }

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->input('kategori_id'));
        }

        if ($request->filled('jenis_transaksi')) {
            $query->where('jenis_transaksi', $request->input('jenis_transaksi'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $transactions = $query->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::orderBy('nama_kategori')->get();

        $nowWib = \Carbon\Carbon::now('Asia/Jakarta');

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => $request->only(['search', 'start_date', 'end_date', 'kategori_id', 'jenis_transaksi', 'status']),
            'operating_hours' => [
                'is_outside_hours' => false,
                'is_closed_today' => false,
                'is_locked_today' => false,
                'kas_status' => [
                    'status' => 'open',
                    'mode' => 'auto_open',
                    'is_locked' => false,
                    'label' => 'Kas Buka 🔓',
                    'description' => 'Kas harian aktif.',
                    'today_closing_id' => null,
                    'is_outside_hours' => false,
                    'today_date' => $nowWib->isoFormat('D MMMM YYYY'),
                    'today_raw_date' => $nowWib->format('Y-m-d'),
                ],
                'formatted_time' => $nowWib->format('H:i') . ' WIB',
            ],
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'nullable|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'nullable|numeric|min:0',
            'nominal_ongkir' => 'required|numeric|min:0',
            'nominal_asuransi' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ], [
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'nominal_ongkir.required' => 'Nominal pendapatan (ongkir) wajib diisi.',
        ]);

        $now = \Carbon\Carbon::now('Asia/Jakarta');
        $todayDate = $now->format('Y-m-d');
        $dateInput = !empty($validated['tanggal']) ? date('Y-m-d', strtotime($validated['tanggal'])) : $todayDate;

        $branch = Branch::first() ?? Branch::create(['nama_cabang' => 'Pos Indonesia Kantor Regional IV Semarang']);

        $dateStr = date('Ymd', strtotime($dateInput));
        $randomSuffix = strtoupper(substr(uniqid(), -4));
        $nomorTransaksi = 'TRX-' . $dateStr . '-' . $randomSuffix;

        $status = 'approved';
        $ongkir = (float) $validated['nominal_ongkir'];
        $asuransi = (float) ($validated['nominal_asuransi'] ?? 0);

        $transaction = Transaction::create([
            'nomor_transaksi' => $nomorTransaksi,
            'tanggal' => $dateInput,
            'jenis_transaksi' => 'pemasukan',
            'kategori_id' => $validated['kategori_id'],
            'cabang_id' => $branch->id,
            'user_id' => $request->user()->id,
            'nominal' => $ongkir,
            'nominal_ongkir' => $ongkir,
            'nominal_asuransi' => $asuransi,
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $status,
        ]);

        // Record Audit Log
        AuditLog::record(
            'CREATE',
            'Transaksi',
            "Mencatat transaksi pendapatan ongkir ({$nomorTransaksi}) Rp " . number_format($ongkir, 0, ',', '.') . " & asuransi Rp " . number_format($asuransi, 0, ',', '.'),
            $request->user()
        );

        return redirect()->back()->with('success', 'Transaksi pendapatan berhasil dicatat.');
    }

    public function update(UpdateTransactionRequest $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'nullable|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'nullable|numeric|min:0',
            'nominal_ongkir' => 'required|numeric|min:0',
            'nominal_asuransi' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ], [
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'nominal_ongkir.required' => 'Nominal pendapatan (ongkir) wajib diisi.',
        ]);

        $targetDate = !empty($validated['tanggal']) ? date('Y-m-d', strtotime($validated['tanggal'])) : $transaction->tanggal;

        $ongkir = (float) $validated['nominal_ongkir'];
        $asuransi = (float) ($validated['nominal_asuransi'] ?? 0);

        $data = [
            'jenis_transaksi' => 'pemasukan',
            'kategori_id' => $validated['kategori_id'],
            'nominal' => $ongkir,
            'nominal_ongkir' => $ongkir,
            'nominal_asuransi' => $asuransi,
            'keterangan' => $validated['keterangan'] ?? null,
        ];

        if (!empty($validated['tanggal'])) {
            $data['tanggal'] = date('Y-m-d', strtotime($validated['tanggal']));
        }

        $oldValues = $transaction->only(['nomor_transaksi', 'tanggal', 'kategori_id', 'nominal', 'keterangan', 'status']);

        DB::transaction(function () use ($transaction, $data, $oldValues, $request, $ongkir, $asuransi) {
            $transaction->update($data);

            // Record Audit Log
            AuditLog::record(
                'UPDATE',
                'Transaksi',
                "Memperbarui data transaksi ({$transaction->nomor_transaksi}) ongkir Rp " . number_format($ongkir, 0, ',', '.') . " & asuransi Rp " . number_format($asuransi, 0, ',', '.'),
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role === 'staff') {
            abort(403, 'Staff hanya dapat menambah dan melihat data transaksi.');
        }

        $transaction = Transaction::findOrFail($id);

        $nomor = $transaction->nomor_transaksi;
        $oldValues = $transaction->only(['nomor_transaksi', 'tanggal', 'kategori_id', 'nominal', 'status']);

        DB::transaction(function () use ($transaction, $nomor, $oldValues, $request) {
            $transaction->delete();

            // Record Audit Log
            AuditLog::record(
                'DELETE',
                'Transaksi',
                "Menghapus data transaksi ({$nomor}) dari sistem",
                $request->user(),
                $oldValues,
                null
            );
        });

        return redirect()->back()->with('success', 'Transaksi berhasil dihapus.');
    }

    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menyetujui atau menolak transaksi.');
        }

        $transaction = Transaction::findOrFail($id);

        DB::transaction(function () use ($transaction, $request) {
            $transaction->update(['status' => 'approved']);

            // Record Audit Log
            AuditLog::record(
                'APPROVE',
                'Transaksi',
                "Menyetujui (Approve) transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Transaksi ' . $transaction->nomor_transaksi . ' berhasil disetujui (Approved).');
    }

    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menyetujui atau menolak transaksi.');
        }

        $transaction = Transaction::findOrFail($id);

        DB::transaction(function () use ($transaction, $request) {
            $transaction->update(['status' => 'rejected']);

            // Record Audit Log
            AuditLog::record(
                'REJECT',
                'Transaksi',
                "Menolak (Reject) transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
                $request->user()
            );
        });

        return redirect()->back()->with('success', 'Transaksi ' . $transaction->nomor_transaksi . ' ditolak (Rejected).');
    }

    public function bulkApprove(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menyetujui atau menolak transaksi.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        $count = count($validated['ids']);

        DB::transaction(function () use ($validated, $count, $request) {
            Transaction::whereIn('id', $validated['ids'])->update(['status' => 'approved']);

            AuditLog::record(
                'BULK_APPROVE',
                'Transaksi',
                "Menyetujui secara massal {$count} transaksi yang dipilih.",
                $request->user()
            );
        });

        return redirect()->back()->with('success', "{$count} transaksi berhasil disetujui (Approved).");
    }

    public function bulkReject(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menyetujui atau menolak transaksi.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        $count = count($validated['ids']);

        DB::transaction(function () use ($validated, $count, $request) {
            Transaction::whereIn('id', $validated['ids'])->update(['status' => 'rejected']);

            AuditLog::record(
                'BULK_REJECT',
                'Transaksi',
                "Menolak secara massal {$count} transaksi yang dipilih.",
                $request->user()
            );
        });

        return redirect()->back()->with('success', "{$count} transaksi ditolak (Rejected).");
    }

    public function bulkDelete(Request $request)
    {
        if ($request->user()->role === 'staff') {
            abort(403, 'Staff hanya dapat menambah dan melihat data transaksi.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        $transactions = Transaction::whereIn('id', $validated['ids'])->get();
        $count = $transactions->count();

        DB::transaction(function () use ($validated, $count, $request) {
            Transaction::whereIn('id', $validated['ids'])->delete();

            AuditLog::record(
                'BULK_DELETE',
                'Transaksi',
                "Menghapus secara massal {$count} transaksi dari sistem.",
                $request->user()
            );
        });

        return redirect()->back()->with('success', "{$count} transaksi berhasil dihapus.");
    }

    public function dailyClosing(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat melakukan Closing Harian.');
        }

        $date = $request->input('tanggal', date('Y-m-d'));

        $query = Transaction::whereDate('tanggal', $date);
        $count = $query->count();

        if ($count === 0) {
            return redirect()->back()->with('error', "Tidak ada transaksi ditemukan pada tanggal " . date('d-m-Y', strtotime($date)) . " untuk di-closing.");
        }

        $query->update([
            'status' => 'approved',
            'closed_at' => now(),
        ]);

        AuditLog::record(
            'DAILY_CLOSING',
            'Transaksi',
            "Melakukan Closing Harian & Approval untuk {$count} transaksi pada tanggal " . date('d-m-Y', strtotime($date)),
            $request->user()
        );

        return redirect()->back()->with('success', "Daily Closing berhasil! {$count} transaksi tanggal " . date('d-m-Y', strtotime($date)) . " telah disetujui & di-closing.");
    }
}
