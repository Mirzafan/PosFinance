<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan PosFinance</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 10px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 15px;
            border-bottom: 3px solid #ff6600; /* Pos Indonesia Orange */
            padding-bottom: 8px;
        }
        .logo-text {
            font-size: 20px;
            font-weight: bold;
            color: #ff6600;
            margin: 0;
        }
        .logo-sub {
            font-size: 9px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 2px 0 0 0;
        }
        .title {
            text-align: right;
            float: right;
            margin-top: -40px;
        }
        .title h2 {
            margin: 0;
            color: #2c3e50;
            font-size: 15px;
        }
        .title p {
            margin: 2px 0 0 0;
            color: #7f8c8d;
            font-size: 9px;
        }
        .info-table {
            width: 100%;
            margin-bottom: 15px;
            border-spacing: 0;
        }
        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .summary-container {
            width: 100%;
            margin-bottom: 15px;
            clear: both;
        }
        .summary-box {
            width: 30%;
            float: left;
            background-color: #f8f9fa;
            border-left: 4px solid #ccd1d1;
            padding: 8px;
            margin-right: 3%;
        }
        .summary-box.income {
            border-left-color: #2ecc71; /* Green */
        }
        .summary-box.expense {
            border-left-color: #e74c3c; /* Red */
        }
        .summary-box.balance {
            border-left-color: #ff6600; /* Orange */
        }
        .summary-box h3 {
            margin: 0 0 4px 0;
            font-size: 9px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        .summary-box p {
            margin: 0;
            font-size: 13px;
            font-weight: bold;
            color: #2c3e50;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #2c3e50;
            margin: 15px 0 8px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        .data-table th {
            background-color: #2c3e50;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 6px 5px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .data-table td {
            padding: 6px 5px;
            border-bottom: 1px solid #bdc3c7;
            vertical-align: top;
        }
        .data-table tr:nth-child(even) {
            background-color: #fdfefe;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            position: fixed;
            bottom: -20px;
            left: 0px;
            right: 0px;
            height: 25px;
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
            <h2>Laporan Pendapatan Kurir & Logistik</h2>
            <p>Dicetak pada: {{ $printed_at }}</p>
        </div>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 15%;"><strong>Periode</strong></td>
            <td style="width: 35%;">: {{ $start_date ? \Carbon\Carbon::parse($start_date)->format('d/m/y') : '-' }} s/d {{ $end_date ? \Carbon\Carbon::parse($end_date)->format('d/m/y') : '-' }}</td>
            <td style="width: 15%;"><strong>Lokasi / Unit</strong></td>
            <td style="width: 35%;">: {{ $branch_name }}</td>
        </tr>
        <tr>
            <td><strong>Layanan</strong></td>
            <td>: {{ $jenis_transaksi }}</td>
            <td><strong>Total Transaksi</strong></td>
            <td>: {{ count($transactions) }} Paket / Resi</td>
        </tr>
    </table>

    <div class="summary-container">
        <div class="summary-box income">
            <h3>Total Pendapatan Ongkir</h3>
            <p>Rp {{ number_format($total_ongkir ?? $total_pemasukan, 0, ',', '.') }}</p>
        </div>
        <div class="summary-box expense">
            <h3>Total Pengeluaran Asuransi</h3>
            <p>Rp {{ number_format($total_asuransi ?? 0, 0, ',', '.') }}</p>
        </div>
        <div class="summary-box balance" style="margin-right: 0;">
            <h3>Pendapatan Bersih (Net)</h3>
            <p>Rp {{ number_format($net_revenue ?? $saldo, 0, ',', '.') }}</p>
        </div>
        <div class="clearfix"></div>
    </div>

    @if(isset($product_summary) && count($product_summary) > 0)
        <div class="section-title">REKAPITULASI PENDAPATAN PER JENIS LAYANAN</div>
        <table class="data-table" style="margin-bottom: 15px;">
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 35%;">JENIS LAYANAN</th>
                    <th style="width: 15%; text-align: center;">JUMLAH TRANSAKSI</th>
                    <th style="width: 15%; text-align: right;">ONGKIR (IDR)</th>
                    <th style="width: 15%; text-align: right;">ASURANSI (IDR)</th>
                    <th style="width: 15%; text-align: right;">NET REVENUE (IDR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($product_summary as $idx => $prod)
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td><strong>{{ $prod['nama_kategori'] }}</strong></td>
                        <td class="text-center">{{ $prod['count'] }} Paket</td>
                        <td class="text-right">Rp {{ number_format($prod['total_ongkir'], 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($prod['total_asuransi'], 0, ',', '.') }}</td>
                        <td class="text-right" style="font-weight: bold; color: #ff6600;">Rp {{ number_format($prod['net_revenue'], 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="section-title">RINCIAN JURNAL TRANSAKSI KEUANGAN</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20%;">NO. TRX</th>
                <th style="width: 12%;">TANGGAL</th>
                <th style="width: 20%;">JENIS LAYANAN</th>
                <th style="width: 16%; text-align: right;">ONGKIR</th>
                <th style="width: 16%; text-align: right;">ASURANSI</th>
                <th style="width: 16%; text-align: right;">NET REVENUE</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $trx)
                @php
                    $ongkir = $trx->nominal_ongkir > 0 ? $trx->nominal_ongkir : $trx->nominal;
                    $asuransi = $trx->nominal_asuransi ?? 0;
                    $net = $ongkir - $asuransi;
                @endphp
                <tr>
                    <td><strong>{{ $trx->nomor_transaksi }}</strong></td>
                    <td>{{ $trx->tanggal ? \Carbon\Carbon::parse($trx->tanggal)->format('d/m/y') : '-' }}</td>
                    <td>{{ $trx->category->nama_kategori ?? '-' }}</td>
                    <td class="text-right">Rp {{ number_format($ongkir, 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #e74c3c;">Rp {{ number_format($asuransi, 0, ',', '.') }}</td>
                    <td class="text-right" style="font-weight: bold;">Rp {{ number_format($net, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 15px; color: #7f8c8d;">
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
