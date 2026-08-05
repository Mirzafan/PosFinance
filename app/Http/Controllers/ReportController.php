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

        $totalOngkir = (float) $transactions->sum(function ($t) {
            return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
        });
        $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
        $netRevenue = $totalOngkir - $totalAsuransi;

        // Product Breakdown Summary
        $categories = Category::orderBy('nama_kategori')->get();
        $productSummary = $categories->map(function ($cat) use ($transactions) {
            $catTrx = $transactions->where('kategori_id', $cat->id);
            $ongkir = (float) $catTrx->sum(function ($t) {
                return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
            });
            $asuransi = (float) $catTrx->sum('nominal_asuransi');
            return [
                'id' => $cat->id,
                'nama_kategori' => $cat->nama_kategori,
                'count' => $catTrx->count(),
                'total_ongkir' => $ongkir,
                'total_asuransi' => $asuransi,
                'net_revenue' => $ongkir - $asuransi,
            ];
        })->values();

        return Inertia::render('Reports/Index', [
            'transactions' => $transactions,
            'summary' => [
                'total_pemasukan' => $totalOngkir,
                'total_ongkir' => $totalOngkir,
                'total_asuransi' => $totalAsuransi,
                'total_pengeluaran' => $totalAsuransi,
                'saldo' => $netRevenue,
                'net_revenue' => $netRevenue,
                'total_item' => $transactions->count(),
            ],
            'productSummary' => $productSummary,
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
        $totalOngkir = (float) $transactions->sum(function ($t) {
            return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
        });
        $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
        $netRevenue = $totalOngkir - $totalAsuransi;

        // Product Summary
        $categories = Category::orderBy('nama_kategori')->get();
        $productSummary = $categories->map(function ($cat) use ($transactions) {
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
        })->values();

        $data = [
            'transactions' => $transactions,
            'start_date' => $startDate ? Carbon::parse($startDate)->format('d F Y') : 'Awal Catatan',
            'end_date' => $endDate ? Carbon::parse($endDate)->format('d F Y') : 'Semua Data',
            'branch_name' => $branchName,
            'jenis_transaksi' => 'Pendapatan Jasa Kurir & Logistik',
            'total_ongkir' => $totalOngkir,
            'total_asuransi' => $totalAsuransi,
            'total_pemasukan' => $totalOngkir,
            'total_pengeluaran' => $totalAsuransi,
            'saldo' => $netRevenue,
            'net_revenue' => $netRevenue,
            'product_summary' => $productSummary,
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
