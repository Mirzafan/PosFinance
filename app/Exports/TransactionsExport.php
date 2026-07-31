<?php

namespace App\Exports;

use App\Models\Transaction;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromQuery, WithMapping, WithHeadings, ShouldAutoSize, WithStyles
{
    use Exportable;

    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Transaction::query()->with('category');

        if (!empty($this->filters['start_date'])) {
            $query->whereDate('tanggal', '>=', $this->filters['start_date']);
        }

        if (!empty($this->filters['end_date'])) {
            $query->whereDate('tanggal', '<=', $this->filters['end_date']);
        }

        if (!empty($this->filters['jenis_transaksi'])) {
            $query->where('jenis_transaksi', $this->filters['jenis_transaksi']);
        }

        $query->where('status', 'approved');

        return $query->orderBy('tanggal', 'asc')->orderBy('id', 'asc');
    }

    public function map($transaction): array
    {
        return [
            $transaction->nomor_transaksi,
            $transaction->tanggal ? Carbon::parse($transaction->tanggal)->format('d-m-Y') : '-',
            ucfirst($transaction->jenis_transaksi),
            $transaction->category->nama_kategori ?? '-',
            $transaction->nominal,
            $transaction->bukti_transaksi ? 'Ada' : 'Tidak Ada',
            $transaction->keterangan ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Nomor Transaksi',
            'Tanggal',
            'Jenis Transaksi',
            'Kategori',
            'Nominal (IDR)',
            'Bukti Transaksi',
            'Keterangan',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
