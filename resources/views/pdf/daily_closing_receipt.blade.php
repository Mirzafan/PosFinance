<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Berita Acara Penutupan Kas Harian - PosFinance</title>
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
            font-size: 18px;
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
            margin-top: -38px;
        }
        .title h2 {
            margin: 0;
            color: #2c3e50;
            font-size: 13px;
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
            background-color: #f8f9fa;
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 6px;
        }
        .info-table td {
            padding: 4px 6px;
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
            font-size: 11px;
            font-weight: bold;
            color: #2c3e50;
            margin: 15px 0 8px 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            text-transform: uppercase;
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
        .signature-container {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 45%;
            float: left;
            text-align: center;
        }
        .signature-box.right {
            float: right;
        }
        .signature-space {
            height: 55px;
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
        .badge-locked {
            display: inline-block;
            background-color: #e6fffa;
            color: #047857;
            border: 1px solid #a7f3d0;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 class="logo-text">POS INDONESIA</h1>
            <p class="logo-sub">Kantor Regional IV Semarang &bull; Sistem PosFinance</p>
        </div>
        <div class="title">
            <h2>BERITA ACARA PENUTUPAN KAS</h2>
            <p>No. Dokumen: BA-CLOSING-{{ \Carbon\Carbon::parse($closing['tanggal'])->format('Ymd') }}</p>
        </div>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 18%;"><strong>Tanggal Tanggung Jawab</strong></td>
            <td style="width: 32%;">: {{ \Carbon\Carbon::parse($closing['tanggal'])->isoFormat('D MMMM YYYY') }}</td>
            <td style="width: 18%;"><strong>Petugas Kasir / Closing</strong></td>
            <td style="width: 32%;">: {{ $closing['user_name'] }}</td>
        </tr>
        <tr>
            <td><strong>Waktu Penutupan</strong></td>
            <td>: {{ $closing['closed_at'] ? \Carbon\Carbon::parse($closing['closed_at'])->format('d/m/Y H:i:s') . ' WIB' : '-' }}</td>
            <td><strong>Status Transaksi</strong></td>
            <td>: <span class="badge-locked">&#128274; TERKUNCI (LOCKED)</span></td>
        </tr>
        <tr>
            <td><strong>Total Pengiriman</strong></td>
            <td>: {{ $closing['total_transaksi'] }} Transaksi Paket/Resi</td>
            <td><strong>Lokasi Kantor</strong></td>
            <td>: PT Pos Indonesia Regional IV Semarang</td>
        </tr>
    </table>

    <div class="summary-container">
        <div class="summary-box income">
            <h3>Total Pemasukan Ongkir</h3>
            <p>Rp {{ number_format($closing['total_pemasukan'], 0, ',', '.') }}</p>
        </div>
        <div class="summary-box expense">
            <h3>Total Pengeluaran Asuransi</h3>
            <p>Rp {{ number_format($closing['total_pengeluaran'], 0, ',', '.') }}</p>
        </div>
        <div class="summary-box balance" style="margin-right: 0;">
            <h3>Saldo Setoran Kas Netto</h3>
            <p>Rp {{ number_format($closing['saldo_akhir'], 0, ',', '.') }}</p>
        </div>
        <div class="clearfix"></div>
    </div>

    @if(isset($category_breakdown) && count($category_breakdown) > 0)
        <div class="section-title">RINCIAN PENUTUPAN PER LAYANAN KURIR</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 35%;">JENIS LAYANAN KURIR</th>
                    <th style="width: 15%; text-align: center;">JUMLAH RESI</th>
                    <th style="width: 15%; text-align: right;">PEMASUKAN ONGKIR</th>
                    <th style="width: 15%; text-align: right;">ASURANSI PAKET</th>
                    <th style="width: 15%; text-align: right;">SALDO NETTO</th>
                </tr>
            </thead>
            <tbody>
                @foreach($category_breakdown as $idx => $cat)
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td><strong>{{ $cat['nama_kategori'] }}</strong></td>
                        <td class="text-center">{{ $cat['count'] }} Paket</td>
                        <td class="text-right">Rp {{ number_format($cat['total_ongkir'], 0, ',', '.') }}</td>
                        <td class="text-right" style="color: #e74c3c;">Rp {{ number_format($cat['total_asuransi'], 0, ',', '.') }}</td>
                        <td class="text-right" style="font-weight: bold; color: #ff6600;">Rp {{ number_format($cat['net_revenue'], 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="signature-container">
        <div class="signature-box">
            <p style="margin-bottom: 2px;">Semarang, {{ \Carbon\Carbon::parse($closing['tanggal'])->isoFormat('D MMMM YYYY') }}</p>
            <p style="font-weight: bold; margin-top: 0;">Diserahkan oleh (Kasir/Staff):</p>
            <div class="signature-space"></div>
            <p style="font-weight: bold; margin-bottom: 0; text-decoration: underline;">{{ $closing['user_name'] }}</p>
            <p style="color: #777; font-size: 8px; margin-top: 2px;">Petugas Kasir Operasional</p>
        </div>

        <div class="signature-box right">
            <p style="margin-bottom: 2px;">Mengetahui & Menyetujui,</p>
            <p style="font-weight: bold; margin-top: 0;">Diterima oleh (Admin Keuangan):</p>
            <div class="signature-space"></div>
            <p style="font-weight: bold; margin-bottom: 0; text-decoration: underline;">Admin Keuangan Regional IV</p>
            <p style="color: #777; font-size: 8px; margin-top: 2px;">PT Pos Indonesia (Persero)</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="footer">
        Dokumen resmi Berita Acara Penutupan Kas Harian PosFinance &bull; PT Pos Indonesia (Persero) Kantor Regional IV Semarang &bull; {{ $printed_at }}
    </div>
</body>
</html>
