<?php

namespace App\Exports;

use App\Models\Transaction;
use App\Models\Category;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class TransactionsExport implements FromCollection, WithTitle, WithEvents, ShouldAutoSize
{
    use Exportable;

    protected $filters;
    protected $transactions;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'Laporan Jurnal PosFinance';
    }

    public function collection()
    {
        $query = Transaction::query()->with('category')->where('status', 'approved');

        if (!empty($this->filters['start_date'])) {
            $query->whereDate('tanggal', '>=', $this->filters['start_date']);
        }

        if (!empty($this->filters['end_date'])) {
            $query->whereDate('tanggal', '<=', $this->filters['end_date']);
        }

        if (!empty($this->filters['jenis_transaksi'])) {
            $query->where('jenis_transaksi', $this->filters['jenis_transaksi']);
        }

        if (!empty($this->filters['kategori_id'])) {
            $query->where('kategori_id', $this->filters['kategori_id']);
        }

        $this->transactions = $query->orderBy('tanggal', 'asc')->orderBy('id', 'asc')->get();

        return collect([]);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $transactions = $this->transactions ?? collect([]);
                $totalRecords = $transactions->count();
                $totalOngkir = (float) $transactions->sum(function ($t) {
                    return $t->nominal_ongkir > 0 ? $t->nominal_ongkir : $t->nominal;
                });
                $totalAsuransi = (float) $transactions->sum('nominal_asuransi');
                $netRevenue = $totalOngkir - $totalAsuransi;

                $startDate = !empty($this->filters['start_date']) 
                    ? Carbon::parse($this->filters['start_date'])->format('d/m/Y') 
                    : null;
                $endDate = !empty($this->filters['end_date']) 
                    ? Carbon::parse($this->filters['end_date'])->format('d/m/Y') 
                    : null;

                if ($startDate && $endDate) {
                    $periodText = "{$startDate} s/d {$endDate}";
                } elseif ($startDate) {
                    $periodText = "Sejak {$startDate}";
                } elseif ($endDate) {
                    $periodText = "Hingga {$endDate}";
                } else {
                    $periodText = "Semua Periode Data";
                }

                // 1. Header Banner
                $sheet->mergeCells('A1:H1');
                $sheet->setCellValue('A1', 'PT POS INDONESIA (PERSERO)');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('D9531E'));

                $sheet->mergeCells('A2:H2');
                $sheet->setCellValue('A2', 'KANTOR REGIONAL IV SEMARANG — POSFINANCE');
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('475569'));

                $sheet->mergeCells('A3:H3');
                $sheet->setCellValue('A3', 'LAPORAN REKAPITULASI PENDAPATAN ONGKIR & ASURANSI KURIR & LOGISTIK');
                $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1E293B'));

                // 2. Summary KPI Cards (Rows 5 to 6)
                $sheet->mergeCells('A5:B5');
                $sheet->setCellValue('A5', 'PERIODE LAPORAN');
                $sheet->getStyle('A5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('64748B'));
                $sheet->mergeCells('A6:B6');
                $sheet->setCellValue('A6', $periodText);
                $sheet->getStyle('A6')->getFont()->setBold(true)->setSize(10)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('0F172A'));
                $sheet->getStyle('A5:B6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F1F5F9');

                $sheet->mergeCells('C5:D5');
                $sheet->setCellValue('C5', 'TOTAL ONGKIR (PEMASUKAN)');
                $sheet->getStyle('C5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('047857'));
                $sheet->mergeCells('C6:D6');
                $sheet->setCellValueExplicit('C6', $totalOngkir, DataType::TYPE_NUMERIC);
                $sheet->getStyle('C6')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('047857'));
                $sheet->getStyle('C6')->getNumberFormat()->setFormatCode('"Rp "#,##0');
                $sheet->getStyle('C5:D6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');

                $sheet->mergeCells('E5:F5');
                $sheet->setCellValue('E5', 'TOTAL ASURANSI (PENGELUARAN)');
                $sheet->getStyle('E5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('B91C1C'));
                $sheet->mergeCells('E6:F6');
                $sheet->setCellValueExplicit('E6', $totalAsuransi, DataType::TYPE_NUMERIC);
                $sheet->getStyle('E6')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('B91C1C'));
                $sheet->getStyle('E6')->getNumberFormat()->setFormatCode('"Rp "#,##0');
                $sheet->getStyle('E5:F6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FEF2F2');

                $sheet->mergeCells('G5:H5');
                $sheet->setCellValue('G5', 'PENDAPATAN BERSIH (NET REVENUE)');
                $sheet->getStyle('G5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1D4ED8'));
                $sheet->mergeCells('G6:H6');
                $sheet->setCellValueExplicit('G6', $netRevenue, DataType::TYPE_NUMERIC);
                $sheet->getStyle('G6')->getFont()->setBold(true)->setSize(12)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1D4ED8'));
                $sheet->getStyle('G6')->getNumberFormat()->setFormatCode('"Rp "#,##0');
                $sheet->getStyle('G5:H6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('EFF6FF');

                // Add Borders to Summary Cards
                $sheet->getStyle('A5:B6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('CBD5E1');
                $sheet->getStyle('C5:D6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('A7F3D0');
                $sheet->getStyle('E5:F6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('FCA5A5');
                $sheet->getStyle('G5:H6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('BFDBFE');

                // Metadata Row (Row 7)
                $sheet->mergeCells('A7:H7');
                $sheet->setCellValue('A7', 'Dicetak pada: ' . Carbon::now()->format('d-m-Y H:i:s') . ' WIB | Total: ' . $totalRecords . ' Transaksi | PosFinance');
                $sheet->getStyle('A7')->getFont()->setItalic(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('94A3B8'));

                // 3. Table Column Headers (Row 9)
                $headers = ['NO', 'NO. TRANSAKSI', 'TANGGAL', 'JENIS LAYANAN', 'ONGKIR (PEMASUKAN)', 'ASURANSI (PENGELUARAN)', 'NET REVENUE', 'KETERANGAN'];
                foreach ($headers as $colIndex => $header) {
                    $columnLetter = chr(65 + $colIndex); // A to H
                    $sheet->setCellValue("{$columnLetter}9", $header);
                }

                $sheet->getStyle('A9:H9')->getFont()->setBold(true)->setSize(10)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFF'));
                $sheet->getStyle('A9:H9')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9531E');
                $sheet->getStyle('A9:H9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getRowDimension(9)->setRowHeight(26);

                // 4. Populate Data Rows starting at Row 10
                $row = 10;
                foreach ($transactions as $index => $trx) {
                    $ongkir = (float) ($trx->nominal_ongkir > 0 ? $trx->nominal_ongkir : $trx->nominal);
                    $asuransi = (float) ($trx->nominal_asuransi ?? 0);
                    $net = $ongkir - $asuransi;

                    $sheet->setCellValue("A{$row}", $index + 1);
                    $sheet->setCellValue("B{$row}", $trx->nomor_transaksi);
                    $sheet->setCellValue("C{$row}", $trx->tanggal ? Carbon::parse($trx->tanggal)->format('d-m-Y') : '-');
                    $sheet->setCellValue("D{$row}", $trx->category->nama_kategori ?? '-');
                    
                    $sheet->setCellValueExplicit("E{$row}", $ongkir, DataType::TYPE_NUMERIC);
                    $sheet->setCellValueExplicit("F{$row}", $asuransi, DataType::TYPE_NUMERIC);
                    $sheet->setCellValueExplicit("G{$row}", $net, DataType::TYPE_NUMERIC);
                    $sheet->setCellValue("H{$row}", $trx->keterangan ?? '-');

                    // Data Alignments
                    $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("F{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("G{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                    // Number format
                    $sheet->getStyle("E{$row}:G{$row}")->getNumberFormat()->setFormatCode('"Rp "#,##0');

                    // Alternating row color
                    $bgColor = ($index % 2 === 0) ? 'FFFFFF' : 'F8FAFC';
                    $sheet->getStyle("A{$row}:H{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($bgColor);

                    $sheet->getRowDimension($row)->setRowHeight(20);
                    $row++;
                }

                $lastDataRow = max(9, $row - 1);
                $sheet->getStyle("A9:H{$lastDataRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('E2E8F0');

                // Adjust column widths
                $sheet->getColumnDimension('A')->setWidth(6);
                $sheet->getColumnDimension('B')->setWidth(24);
                $sheet->getColumnDimension('C')->setWidth(14);
                $sheet->getColumnDimension('D')->setWidth(20);
                $sheet->getColumnDimension('E')->setWidth(22);
                $sheet->getColumnDimension('F')->setWidth(22);
                $sheet->getColumnDimension('G')->setWidth(22);
                $sheet->getColumnDimension('H')->setWidth(30);
            },
        ];
    }
}
