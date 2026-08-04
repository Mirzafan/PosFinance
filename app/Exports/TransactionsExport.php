<?php

namespace App\Exports;

use App\Models\Transaction;
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

                // Fetch Data
                $transactions = $this->transactions ?? collect([]);
                $totalRecords = $transactions->count();
                $totalNominal = (float) $transactions->sum('nominal');

                // Determine Date Range Subtitle
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
                $sheet->mergeCells('A1:G1');
                $sheet->setCellValue('A1', 'PT POS INDONESIA (PERSERO)');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('D9531E'));

                $sheet->mergeCells('A2:G2');
                $sheet->setCellValue('A2', 'KANTOR REGIONAL IV SEMARANG — POSFINANCE');
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('475569'));

                $sheet->mergeCells('A3:G3');
                $sheet->setCellValue('A3', 'LAPORAN REKAPITULASI JURNAL TRANSAKSI KEUANGAN LAYANAN KURIR & LOGISTIK');
                $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1E293B'));

                // 2. Summary KPI Cards (Rows 5 to 6)
                $sheet->mergeCells('A5:B5');
                $sheet->setCellValue('A5', 'PERIODE LAPORAN');
                $sheet->getStyle('A5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('64748B'));

                $sheet->mergeCells('A6:B6');
                $sheet->setCellValue('A6', $periodText);
                $sheet->getStyle('A6')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('0F172A'));
                $sheet->getStyle('A5:B6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F1F5F9');

                $sheet->mergeCells('C5:D5');
                $sheet->setCellValue('C5', 'TOTAL TRANSAKSI');
                $sheet->getStyle('C5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('64748B'));

                $sheet->mergeCells('C6:D6');
                $sheet->setCellValue('C6', $totalRecords . ' Record Transaksi');
                $sheet->getStyle('C6')->getFont()->setBold(true)->setSize(11)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('0F172A'));
                $sheet->getStyle('C5:D6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F1F5F9');

                $sheet->mergeCells('E5:G5');
                $sheet->setCellValue('E5', 'TOTAL NOMINAL PENDAPATAN LAYANAN');
                $sheet->getStyle('E5')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('047857'));

                $sheet->mergeCells('E6:G6');
                $sheet->setCellValueExplicit('E6', $totalNominal, DataType::TYPE_NUMERIC);
                $sheet->getStyle('E6')->getFont()->setBold(true)->setSize(12)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('047857'));
                $sheet->getStyle('E6')->getNumberFormat()->setFormatCode('"Rp "#,##0');
                $sheet->getStyle('E5:G6')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('ECFDF5');

                // Add Borders to Summary Cards
                $sheet->getStyle('A5:B6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('CBD5E1');
                $sheet->getStyle('C5:D6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('CBD5E1');
                $sheet->getStyle('E5:G6')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('A7F3D0');

                // Metadata Row (Row 7)
                $sheet->mergeCells('A7:G7');
                $sheet->setCellValue('A7', 'Dicetak pada: ' . Carbon::now()->format('d-m-Y H:i:s') . ' WIB | Sistem Informasi Keuangan PosFinance');
                $sheet->getStyle('A7')->getFont()->setItalic(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('94A3B8'));

                // 3. Table Column Headers (Row 9)
                $headers = ['NO', 'NO. TRANSAKSI', 'TANGGAL', 'JENIS', 'KATEGORI LAYANAN', 'NOMINAL (IDR)', 'KETERANGAN'];
                foreach ($headers as $colIndex => $header) {
                    $columnLetter = chr(65 + $colIndex); // A, B, C...
                    $sheet->setCellValue("{$columnLetter}9", $header);
                }

                $sheet->getStyle('A9:G9')->getFont()->setBold(true)->setSize(10)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFF'));
                $sheet->getStyle('A9:G9')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('D9531E'); // Pos Corporate Orange
                $sheet->getStyle('A9:G9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getRowDimension(9)->setRowHeight(26);

                // 4. Populate Data Rows starting at Row 10
                $row = 10;
                foreach ($transactions as $index => $trx) {
                    $sheet->setCellValue("A{$row}", $index + 1);
                    $sheet->setCellValue("B{$row}", $trx->nomor_transaksi);
                    $sheet->setCellValue("C{$row}", $trx->tanggal ? Carbon::parse($trx->tanggal)->format('d-m-Y') : '-');
                    $sheet->setCellValue("D{$row}", ucfirst($trx->jenis_transaksi));
                    $sheet->setCellValue("E{$row}", $trx->category->nama_kategori ?? '-');
                    
                    // Explicitly set TYPE_NUMERIC for nominal
                    $sheet->setCellValueExplicit("F{$row}", (float) $trx->nominal, DataType::TYPE_NUMERIC);
                    
                    $sheet->setCellValue("G{$row}", $trx->keterangan ?? '-');

                    // Data Alignments
                    $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("F{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("G{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                    // Number format for nominal
                    $sheet->getStyle("F{$row}")->getNumberFormat()->setFormatCode('"Rp "#,##0');

                    // Alternating background colors
                    $bgColor = ($index % 2 === 0) ? 'FFFFFF' : 'F8FAFC';
                    $sheet->getStyle("A{$row}:G{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($bgColor);

                    // Row height
                    $sheet->getRowDimension($row)->setRowHeight(20);

                    $row++;
                }

                $lastDataRow = max(9, $row - 1);

                // Table Borders
                $sheet->getStyle("A9:G{$lastDataRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('E2E8F0');

                // Adjust column widths manually for optimal clarity
                $sheet->getColumnDimension('A')->setWidth(6);
                $sheet->getColumnDimension('B')->setWidth(24);
                $sheet->getColumnDimension('C')->setWidth(14);
                $sheet->getColumnDimension('D')->setWidth(15);
                $sheet->getColumnDimension('E')->setWidth(22);
                $sheet->getColumnDimension('F')->setWidth(22);
                $sheet->getColumnDimension('G')->setWidth(35);
            },
        ];
    }
}
