<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\Branch;
use App\Models\AuditLog;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'required|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_transaksi' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ], [
            'jenis_transaksi.required' => 'Jenis transaksi wajib dipilih.',
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'nominal.required' => 'Nominal transaksi wajib diisi.',
            'bukti_transaksi.required' => 'Bukti transaksi (foto/PDF) wajib diunggah.',
            'bukti_transaksi.mimes' => 'Bukti transaksi harus berupa foto (JPG, PNG, WEBP) atau dokumen PDF.',
            'bukti_transaksi.max' => 'Ukuran file bukti transaksi maksimal 10 MB.',
        ]);

        $dateInput = !empty($request->input('tanggal')) ? date('Y-m-d', strtotime($request->input('tanggal'))) : date('Y-m-d');

        $branch = Branch::first();
        if (!$branch) {
            $branch = Branch::create(['nama_cabang' => 'Pos Indonesia Kantor Regional IV Semarang']);
        }

        $buktiPath = null;
        if ($request->hasFile('bukti_transaksi')) {
            $buktiPath = $request->file('bukti_transaksi')->store('bukti_transaksi', 'public');
        }

        $dateStr = date('Ymd', strtotime($dateInput));
        $randomSuffix = strtoupper(substr(uniqid(), -4));
        $nomorTransaksi = 'TRX-' . $dateStr . '-' . $randomSuffix;

        // Staff entries require Admin/Supervisor approval (status = pending)
        // Admin or Supervisor entries are automatically approved
        $userRole = $request->user()->role;
        $status = ($userRole === 'staff') ? 'pending' : 'approved';

        $transaction = Transaction::create([
            'nomor_transaksi' => $nomorTransaksi,
            'tanggal' => $dateInput,
            'jenis_transaksi' => $validated['jenis_transaksi'],
            'kategori_id' => $validated['kategori_id'],
            'cabang_id' => $branch->id,
            'user_id' => $request->user()->id,
            'nominal' => $validated['nominal'],
            'keterangan' => $validated['keterangan'] ?? null,
            'status' => $status,
            'bukti_transaksi' => $buktiPath,
        ]);

        // Record Audit Log
        AuditLog::record(
            'CREATE',
            'Transaksi',
            "Mencatat transaksi {$validated['jenis_transaksi']} baru ({$nomorTransaksi}) nominal Rp " . number_format($validated['nominal'], 0, ',', '.') . " [Status: " . ucfirst($status) . "]",
            $request->user()
        );

        $msg = ($status === 'pending') 
            ? 'Transaksi berhasil dicatat dan menunggu persetujuan (approval) Admin/Supervisor.' 
            : 'Transaksi berhasil dicatat.';

        return redirect()->back()->with('success', $msg);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role === 'staff') {
            abort(403, 'Staff hanya dapat menambah dan melihat data transaksi.');
        }

        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'tanggal' => 'nullable|date',
            'jenis_transaksi' => 'required|in:pemasukan,pengeluaran',
            'kategori_id' => 'required|exists:categories,id',
            'nominal' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_transaksi' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ], [
            'jenis_transaksi.required' => 'Jenis transaksi wajib dipilih.',
            'kategori_id.required' => 'Kategori wajib dipilih.',
            'nominal.required' => 'Nominal transaksi wajib diisi.',
            'bukti_transaksi.mimes' => 'Bukti transaksi harus berupa foto (JPG, PNG, WEBP) atau dokumen PDF.',
            'bukti_transaksi.max' => 'Ukuran file bukti transaksi maksimal 10 MB.',
        ]);

        $data = [
            'jenis_transaksi' => $validated['jenis_transaksi'],
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

        $transaction->update($data);

        // Record Audit Log
        AuditLog::record(
            'UPDATE',
            'Transaksi',
            "Memperbarui rincian data transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
            $request->user()
        );

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
        $transaction->delete();

        // Record Audit Log
        AuditLog::record(
            'DELETE',
            'Transaksi',
            "Menghapus data transaksi ({$nomor}) dari sistem",
            $request->user()
        );

        return redirect()->back()->with('success', 'Transaksi berhasil dihapus.');
    }

    public function approve(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['admin', 'supervisor'])) {
            abort(403, 'Hanya Admin dan Supervisor yang dapat menyetujui transaksi.');
        }

        $transaction = Transaction::findOrFail($id);
        $transaction->update(['status' => 'approved']);

        // Record Audit Log
        AuditLog::record(
            'APPROVE',
            'Transaksi',
            "Menyetujui (Approve) transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
            $request->user()
        );

        return redirect()->back()->with('success', 'Transaksi ' . $transaction->nomor_transaksi . ' berhasil disetujui (Approved).');
    }

    public function reject(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['admin', 'supervisor'])) {
            abort(403, 'Hanya Admin dan Supervisor yang dapat menolak transaksi.');
        }

        $transaction = Transaction::findOrFail($id);
        $transaction->update(['status' => 'rejected']);

        // Record Audit Log
        AuditLog::record(
            'REJECT',
            'Transaksi',
            "Menolak (Reject) transaksi ({$transaction->nomor_transaksi}) nominal Rp " . number_format($transaction->nominal, 0, ',', '.'),
            $request->user()
        );

        return redirect()->back()->with('success', 'Transaksi ' . $transaction->nomor_transaksi . ' ditolak (Rejected).');
    }
}
