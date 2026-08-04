<?php

namespace App\Http\Controllers;

use App\Exports\TransactionsExport;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'branch']);

        if ($request->filled('start_date')) {
            $query->whereDate('tanggal', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('tanggal', '<=', $request->input('end_date'));
        }

        if ($request->filled('jenis_transaksi')) {
            $query->where('jenis_transaksi', $request->input('jenis_transaksi'));
        }

        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->input('kategori_id'));
        }

        // Laporan hanya menghitung transaksi yang sudah disetujui (Approved)
        $query->where('status', 'approved');

        $transactions = $query->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $totalPemasukan = (float) $transactions->sum('nominal');

        $categories = Category::orderBy('nama_kategori')->get();

        return Inertia::render('Reports/Index', [
            'transactions' => $transactions,
            'summary' => [
                'total_pemasukan' => $totalPemasukan,
                'net_profit' => $totalPemasukan,
                'saldo' => $totalPemasukan,
                'total_item' => $transactions->count(),
            ],
            'categories' => $categories,
            'filters' => $request->only(['start_date', 'end_date', 'kategori_id']),
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filters = [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'kategori_id' => $request->input('kategori_id'),
        ];

        return Excel::download(new TransactionsExport($filters), 'laporan-pendapatan-retail-' . date('Ymd-His') . '.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $kategoriId = $request->input('kategori_id');

        $query = Transaction::with(['category', 'branch']);

        if ($startDate) {
            $query->whereDate('tanggal', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('tanggal', '<=', $endDate);
        }

        if ($kategoriId) {
            $query->where('kategori_id', $kategoriId);
        }

        $query->where('status', 'approved');

        $transactions = $query->orderBy('tanggal', 'asc')->orderBy('id', 'asc')->get();

        $branchName = 'Pos Indonesia Kantor Regional IV Semarang';

        // Calculate Totals
        $totalPemasukan = (float) $transactions->sum('nominal');

        $data = [
            'transactions' => $transactions,
            'start_date' => $startDate ? Carbon::parse($startDate)->format('d F Y') : 'Awal Catatan',
            'end_date' => $endDate ? Carbon::parse($endDate)->format('d F Y') : 'Semua Data',
            'branch_name' => $branchName,
            'total_pemasukan' => $totalPemasukan,
            'net_profit' => $totalPemasukan,
            'saldo' => $totalPemasukan,
            'printed_at' => Carbon::now()->format('d-m-Y H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.report', $data);
        
        return $pdf->download('laporan-posfinance-regional4-' . date('Ymd-His') . '.pdf');
    }

    public function exportFlowchartPdf()
    {
        $data = [
            'printed_at' => Carbon::now()->format('d-m-Y H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.flowchart', $data);
        
        return $pdf->download('flowchart-posfinance-regional4-' . date('Ymd-His') . '.pdf');
    }
}
