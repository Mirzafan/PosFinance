<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan PosFinance</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 3px solid #ff6600; /* Pos Indonesia Orange */
            padding-bottom: 10px;
        }
        .logo-text {
            font-size: 22px;
            font-weight: bold;
            color: #ff6600;
            margin: 0;
        }
        .logo-sub {
            font-size: 10px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 2px 0 0 0;
        }
        .title {
            text-align: right;
            float: right;
            margin-top: -45px;
        }
        .title h2 {
            margin: 0;
            color: #2c3e50;
            font-size: 16px;
        }
        .title p {
            margin: 3px 0 0 0;
            color: #7f8c8d;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
            border-spacing: 0;
        }
        .info-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .summary-container {
            width: 100%;
            margin-bottom: 25px;
            clear: both;
        }
        .summary-box {
            width: 30%;
            float: left;
            background-color: #f8f9fa;
            border-left: 4px solid #ccd1d1;
            padding: 10px;
            margin-right: 3%;
        }
        .summary-box.income {
            border-left-color: #2ecc71; /* Green */
        }
        .summary-box.expense {
            border-left-color: #e74c3c; /* Red */
        }
        .summary-box.balance {
            border-left-color: #3498db; /* Blue */
        }
        .summary-box h3 {
            margin: 0 0 5px 0;
            font-size: 10px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        .summary-box p {
            margin: 0;
            font-size: 15px;
            font-weight: bold;
            color: #2c3e50;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .data-table th {
            background-color: #2c3e50;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 6px;
            font-size: 10px;
            text-transform: uppercase;
        }
        .data-table td {
            padding: 8px 6px;
            border-bottom: 1px solid #bdc3c7;
            vertical-align: top;
        }
        .data-table tr:nth-child(even) {
            background-color: #fdfefe;
        }
        .text-right {
            text-align: right;
        }
        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-income {
            background-color: #d4edda;
            color: #155724;
        }
        .badge-expense {
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            position: fixed;
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 30px;
            text-align: center;
            color: #bdc3c7;
            font-size: 8px;
            border-top: 1px solid #ecf0f1;
            padding-top: 5px;
        }
        .clearfix {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 class="logo-text">POS INDONESIA</h1>
            <p class="logo-sub">Kantor Regional IV Semarang - Laporan Pendapatan Retail</p>
        </div>
        <div class="title">
            <h2>Laporan Pendapatan Retail</h2>
            <p>Dicetak pada: {{ $printed_at }}</p>
        </div>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 15%;"><strong>Periode</strong></td>
            <td style="width: 35%;">: {{ $start_date }} s/d {{ $end_date }}</td>
            <td style="width: 15%;"><strong>Lokasi / Unit</strong></td>
            <td style="width: 35%;">: {{ $branch_name }}</td>
        </tr>
    </table>

    <div class="summary-container">
        <div class="summary-box income" style="width: 48%;">
            <h3>Total Pendapatan Retail (Omset)</h3>
            <p style="color: #27ae60;">Rp {{ number_format($total_pemasukan, 2, ',', '.') }}</p>
        </div>
        <div class="summary-box balance" style="width: 48%; margin-right: 0;">
            <h3>Total Catatan Transaksi</h3>
            <p>{{ count($transactions) }} Transaksi</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 18%;">No. Trx</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 20%;">Kategori Retail</th>
                <th style="width: 27%;">Keterangan</th>
                <th style="width: 8%; text-align: center;">Bukti</th>
                <th style="width: 15%; text-align: right;">Nominal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $trx)
                <tr>
                    <td><strong>{{ $trx->nomor_transaksi }}</strong></td>
                    <td>{{ $trx->tanggal ? \Carbon\Carbon::parse($trx->tanggal)->format('d-m-Y') : '-' }}</td>
                    <td>{{ $trx->category->nama_kategori ?? '-' }}</td>
                    <td>{{ $trx->keterangan ?? '-' }}</td>
                    <td style="text-align: center;">
                        @if($trx->bukti_transaksi)
                            <span style="color: #27ae60; font-weight: bold;">Ada</span>
                        @else
                            <span style="color: #95a5a6;">Tidak Ada</span>
                        @endif
                    </td>
                    <td class="text-right">Rp {{ number_format($trx->nominal, 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #7f8c8d;">
                        Tidak ada data transaksi yang ditemukan untuk kriteria ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        PosFinance &copy; 2026 PT Pos Indonesia (Persero) Kantor Regional IV Semarang. Dokumen resmi laporan keuangan.
    </div>
</body>
</html>
