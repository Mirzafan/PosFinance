<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Branch;
use App\Models\AuditLog;
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

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => $request->only(['search', 'start_date', 'end_date', 'kategori_id', 'jenis_transaksi', 'status']),
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validated();

        $dateInput = !empty($validated['tanggal']) ? date('Y-m-d', strtotime($validated['tanggal'])) : date('Y-m-d');

        $branch = Branch::first() ?? Branch::create(['nama_cabang' => 'Pos Indonesia Kantor Regional IV Semarang']);

        $buktiPath = null;
        if ($request->hasFile('bukti_transaksi')) {
            $buktiPath = $request->file('bukti_transaksi')->store('bukti_transaksi', 'public');
        }

        $dateStr = date('Ymd', strtotime($dateInput));
        $randomSuffix = strtoupper(substr(uniqid(), -4));
        $nomorTransaksi = 'TRX-' . $dateStr . '-' . $randomSuffix;

        $status = 'approved';

        DB::transaction(function () use ($validated, $dateInput, $branch, $buktiPath, $nomorTransaksi, $status, $request) {
            $transaction = Transaction::create([
                'nomor_transaksi' => $nomorTransaksi,
                'tanggal' => $dateInput,
                'jenis_transaksi' => 'pemasukan',
                'kategori_id' => $validated['kategori_id'],
                'cabang_id' => $branch->id,
                'user_id' => $request->user()->id,
                'nominal' => $validated['nominal'],
                'keterangan' => $validated['keterangan'] ?? null,
                'status' => $status,
                'bukti_transaksi' => $buktiPath,
            ]);

            // Record Audit Log with new values
            AuditLog::record(
                'CREATE',
                'Transaksi',
                "Mencatat pendapatan retail baru ({$nomorTransaksi}) nominal Rp " . number_format($validated['nominal'], 0, ',', '.') . " [Status: Approved]",
                $request->user(),
                null,
                $transaction->only(['nomor_transaksi', 'tanggal', 'jenis_transaksi', 'kategori_id', 'nominal', 'status'])
            );
        });

        return redirect()->back()->with('success', 'Pendapatan retail berhasil dicatat.');
    }

    public function update(UpdateTransactionRequest $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validated();

        $data = [
            'jenis_transaksi' => 'pemasukan',
            'kategori_id' => $validated['kategori_id'],
            'nominal' => $validated['nominal'],
            'keterangan' => $validated['keterangan'] ?? null,
        ];

        if (!empty($validated['tanggal'])) {
            $data['tanggal'] = date('Y-m-d', strtotime($validated['tanggal']));
        }

        if ($request->hasFile('bukti_transaksi')) {
            if ($transaction->bukti_transaksi && Storage::disk('public')->exists($transaction->bukti_transaksi)) {
                Storage::disk('public')->delete($transaction->bukti_transaksi);
            }
            $data['bukti_transaksi'] = $request->file('bukti_transaksi')->store('bukti_transaksi', 'public');
        }

        $oldValues = $transaction->only(['nomor_transaksi', 'tanggal', 'kategori_id', 'nominal', 'keterangan', 'status']);

        DB::transaction(function () use ($transaction, $data, $oldValues, $request) {
            $transaction->update($data);

            // Record Audit Log with old & new values
            AuditLog::record(
                'UPDATE',
                'Transaksi',
                "Memperbarui rincian data transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
                $request->user(),
                $oldValues,
                $transaction->only(['nomor_transaksi', 'tanggal', 'kategori_id', 'nominal', 'keterangan', 'status'])
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

        if ($transaction->bukti_transaksi && Storage::disk('public')->exists($transaction->bukti_transaksi)) {
            Storage::disk('public')->delete($transaction->bukti_transaksi);
        }

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

        foreach ($transactions as $t) {
            if ($t->bukti_transaksi && Storage::disk('public')->exists($t->bukti_transaksi)) {
                Storage::disk('public')->delete($t->bukti_transaksi);
            }
        }

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
}
