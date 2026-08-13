<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Flowchart Sistem PosFinance - Regional IV Semarang</title>
    <style>
        @page {
            margin: 20px 25px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #000000;
            font-size: 10px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .header {
            border-bottom: 2px solid #000000;
            padding-bottom: 6px;
            margin-bottom: 12px;
        }
        .logo-title {
            font-size: 16px;
            font-weight: bold;
            color: #000000;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .logo-subtitle {
            font-size: 10px;
            font-weight: bold;
            color: #333333;
            margin: 2px 0 0 0;
        }
        .doc-info {
            float: right;
            text-align: right;
            margin-top: -32px;
            font-size: 8.5px;
            color: #444444;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #000000;
            background-color: #f2f2f2;
            padding: 5px 8px;
            border: 1px solid #000000;
            margin-top: 10px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .flowchart-container {
            text-align: center;
            margin: 10px 0;
            padding: 5px;
            background-color: #ffffff;
            border: 1px solid #000000;
        }
        .table-journal {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 12px;
        }
        .table-journal th {
            background-color: #e6e6e6;
            color: #000000;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            padding: 5px 7px;
            text-transform: uppercase;
            border: 1px solid #000000;
        }
        .table-journal td {
            padding: 5px 7px;
            border: 1px solid #000000;
            font-size: 8.5px;
            vertical-align: top;
        }
        .footer {
            margin-top: 15px;
            padding-top: 6px;
            border-top: 1px stroke #000000;
            text-align: center;
            font-size: 8px;
            color: #555555;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>

    <!-- Header Dokumen Formal Jurnal -->
    <div class="header">
        <div>
            <h1 class="logo-title">PT POS INDONESIA (PERSERO)</h1>
            <p class="logo-subtitle">KANTOR REGIONAL IV SEMARANG — APILKASI POSFINANCE</p>
        </div>
        <div class="doc-info">
            <strong>DIAGRAM FLOWCHART ALUR SISTEM</strong><br>
            Spesifikasi Jurnal & Pembukuan Kas<br>
            Tanggal: {{ $printed_at }}
        </div>
    </div>

    <!-- Judul Dokumen -->
    <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 13px; color: #000000; text-transform: uppercase;">
            DIAGRAM FLOWCHART ALUR KERJA APLIKASI KEUANGAN DIGITAL
        </h2>
        <p style="margin: 2px 0 0 0; color: #444444; font-size: 9.5px; font-style: italic;">
            PosFinance Financial System Workflow — PT Pos Indonesia Regional IV Semarang
        </p>
    </div>

    <!-- Visual Standard Flowchart Diagram SVG -->
    <div class="section-title">1. Diagram Alur Sistem Standard Flowchart</div>

    <div class="flowchart-container">
        <svg width="640" height="850" viewBox="0 0 640 850" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#000000"/>
                </marker>
            </defs>

            <!-- 1. Start Node (Oval) -->
            <rect x="250" y="10" width="140" height="38" rx="19" ry="19" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="34" fill="#000000" font-size="11" font-weight="bold" text-anchor="middle">Mulai</text>

            <!-- Arrow 1 -->
            <line x1="320" y1="48" x2="320" y2="75" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- 2. Input Email & Password (Parallelogram) -->
            <polygon points="230,75  440,75  410,118  200,118" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="101" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">Masukan Email & Password</text>

            <!-- Arrow 2 -->
            <line x1="320" y1="118" x2="320" y2="145" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- 3. Process: Verifikasi Akun & Hak Akses (Rectangle) -->
            <rect x="200" y="145" width="240" height="42" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="164" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">Verifikasi Akun & Hak Akses</text>
            <text x="320" y="177" fill="#333333" font-size="8.5" text-anchor="middle">(Admin / Staff)</text>

            <!-- Arrow 3 -->
            <line x1="320" y1="187" x2="320" y2="215" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- 4. Decision: ? Akun Valid (Diamond) -->
            <polygon points="320,215  405,250  320,285  235,250" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="254" fill="#000000" font-size="9.5" font-weight="bold" text-anchor="middle">? Akun Valid</text>

            <!-- Branch 4 - Tidak (Left to Parallelogram Error -> Loop back to Input) -->
            <line x1="235" y1="250" x2="170" y2="250" stroke="#000000" stroke-width="1.5" marker-end="url(#arrow)"/>
            <text x="195" y="243" fill="#000000" font-size="9" font-weight="bold">Tidak</text>

            <!-- Parallelogram Error Output -->
            <polygon points="50,230  170,230  150,270  30,270" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
            <text x="100" y="254" fill="#000000" font-size="8.5" text-anchor="middle">Tampilkan Error</text>

            <!-- Loop Arrow Back to Input Credentials -->
            <path d="M 100,230 L 100,96.5 L 210,96.5" fill="none" stroke="#000000" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow)"/>

            <!-- Branch 4 - Ya (Down) -->
            <line x1="320" y1="285" x2="320" y2="315" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>
            <text x="327" y="302" fill="#000000" font-size="9" font-weight="bold">Ya</text>

            <!-- 5. Process: Tampilkan Dashboard (Rectangle) -->
            <rect x="190" y="315" width="260" height="42" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="334" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">Tampilkan Dashboard Keuangan</text>
            <text x="320" y="347" fill="#333333" font-size="8.5" text-anchor="middle">Summary Kas, Grafik & Navigasi Menu</text>

            <!-- Arrow 5 -->
            <line x1="320" y1="357" x2="320" y2="385" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- 6. Decision: ? Pilih Modul (Diamond) -->
            <polygon points="320,385  410,420  320,455  230,420" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="424" fill="#000000" font-size="9.5" font-weight="bold" text-anchor="middle">? Pilih Modul</text>

            <!-- Branch 6A: Input Transaksi (Left) -->
            <line x1="230" y1="420" x2="145" y2="420" stroke="#000000" stroke-width="2"/>
            <text x="180" y="413" fill="#000000" font-size="8.5" font-weight="bold">Jurnal Transaksi</text>
            <line x1="145" y1="420" x2="145" y2="460" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 7A: Input Data Transaksi (Parallelogram) -->
            <polygon points="40,460  270,460  240,505  10,505" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="140" y="482" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Masukan Data Transaksi</text>
            <text x="140" y="494" fill="#333333" font-size="8" text-anchor="middle">(Tanggal, Jenis, Kategori, Nominal)</text>

            <!-- Arrow 7A -->
            <line x1="140" y1="505" x2="140" y2="535" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 8A: Generate No Transaksi (Rectangle) -->
            <rect x="25" y="535" width="230" height="42" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="140" y="554" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Generate No. Transaksi Unik</text>
            <text x="140" y="567" fill="#333333" font-size="8" text-anchor="middle">(TRX-YYYYMMDD-XXXX Ascending)</text>

            <!-- Arrow 8A -->
            <line x1="140" y1="577" x2="140" y2="605" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 9A: Process Simpan DB (Rectangle) -->
            <rect x="25" y="605" width="230" height="42" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="140" y="624" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Simpan Transaksi ke Database</text>
            <text x="140" y="637" fill="#333333" font-size="8" text-anchor="middle">Record Kas Regional IV Semarang</text>

            <!-- Arrow 9A -->
            <line x1="140" y1="647" x2="140" y2="675" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 10A: Output Update Tabel (Parallelogram) -->
            <polygon points="40,675  270,675  240,718  10,718" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="140" y="696" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Tampilkan Notifikasi Sukses</text>
            <text x="140" y="708" fill="#333333" font-size="8" text-anchor="middle">& Update Tabel Transaksi</text>

            <!-- Merge Path 10A to End -->
            <line x1="140" y1="718" x2="140" y2="760" stroke="#000000" stroke-width="2"/>
            <line x1="140" y1="760" x2="320" y2="760" stroke="#000000" stroke-width="2"/>

            <!-- Branch 6B: Ekspor Laporan (Right) -->
            <line x1="410" y1="420" x2="495" y2="420" stroke="#000000" stroke-width="2"/>
            <text x="445" y="413" fill="#000000" font-size="8.5" font-weight="bold">Ekspor Laporan</text>
            <line x1="495" y1="420" x2="495" y2="460" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 7B: Input Filter (Parallelogram) -->
            <polygon points="395,460  625,460  595,505  365,505" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="495" y="482" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Pilih Filter Laporan</text>
            <text x="495" y="494" fill="#333333" font-size="8" text-anchor="middle">(Periode Tanggal & Jenis Kas)</text>

            <!-- Arrow 7B -->
            <line x1="495" y1="505" x2="495" y2="535" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 8B: Process Rekapitulasi (Rectangle) -->
            <rect x="380" y="535" width="230" height="42" rx="4" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="495" y="554" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Olah & Rekapitulasi Data Kas</text>
            <text x="495" y="567" fill="#333333" font-size="8" text-anchor="middle">Hitung Total Kas & Saldo</text>

            <!-- Arrow 8B -->
            <line x1="495" y1="577" x2="495" y2="675" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Node 9B: Output Export File (Parallelogram) -->
            <polygon points="395,675  625,675  595,718  365,718" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="495" y="696" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Cetak & Unduh File Laporan</text>
            <text x="495" y="708" fill="#333333" font-size="8" text-anchor="middle">Format Excel (.xlsx) / PDF (.pdf)</text>

            <!-- Merge Path 9B to End -->
            <line x1="495" y1="718" x2="495" y2="760" stroke="#000000" stroke-width="2"/>
            <line x1="495" y1="760" x2="320" y2="760" stroke="#000000" stroke-width="2"/>

            <!-- Common Down Arrow to End -->
            <line x1="320" y1="760" x2="320" y2="790" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- 11. End Node (Oval) -->
            <rect x="250" y="790" width="140" height="38" rx="19" ry="19" fill="#ffffff" stroke="#000000" stroke-width="2"/>
            <text x="320" y="814" fill="#000000" font-size="11" font-weight="bold" text-anchor="middle">Selesai</text>
        </svg>
    </div>

    <!-- Page Break untuk Penjelasan Simbol & Prosedur -->
    <div class="page-break"></div>

    <!-- Header Halaman 2 -->
    <div class="header">
        <div>
            <h1 class="logo-title">PT POS INDONESIA (PERSERO)</h1>
            <p class="logo-subtitle">KANTOR REGIONAL IV SEMARANG — KETERANGAN SIMBOL FLOWCHART</p>
        </div>
        <div class="doc-info">
            Halaman 2 dari 2<br>
            Lampiran Spesifikasi Sistem
        </div>
    </div>

    <!-- Section 2: Keterangan Simbol Standard Flowchart -->
    <div class="section-title">2. Keterangan Simbol Diagram Flowchart</div>
    <table class="table-journal">
        <thead>
            <tr>
                <th style="width: 25%;">Bentuk Simbol</th>
                <th style="width: 25%;">Nama Simbol</th>
                <th style="width: 50%;">Fungsi & Peranan Dalam Sistem</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Oval (Pill Shape)</strong></td>
                <td>Terminator</td>
                <td>Menandai titik awal (Mulai) dan titik akhir (Selesai) dari alur kerja aplikasi PosFinance.</td>
            </tr>
            <tr>
                <td><strong>Jajaran Genjang</strong></td>
                <td>Input / Output</td>
                <td>Representasi proses memasukkan data (seperti email/password, input transaksi, filter laporan) dan keluaran informasi (tampilan notifikasi, tabel, serta file Excel/PDF).</td>
            </tr>
            <tr>
                <td><strong>Persegi Panjang</strong></td>
                <td>Process</td>
                <td>Menunjukkan proses pengolahan internal sistem, seperti verifikasi kredensial user, pembuatan ID unik transaksi, penyimpan data ke database, dan kalkulasi rekapitulasi saldo.</td>
            </tr>
            <tr>
                <td><strong>Belah Ketupat</strong></td>
                <td>Decision (Keputusan)</td>
                <td>Percabangan logika kondisional untuk mengecek keabsahan otentikasi akun serta penentuan jenis modul aktivitas yang dipilih pengguna.</td>
            </tr>
        </tbody>
    </table>

    <!-- Section 3: Ringkasan Spesifikasi Sistem -->
    <div class="section-title">3. Ringkasan Fitur Utama PosFinance Regional IV Semarang</div>
    <table class="table-journal">
        <thead>
            <tr>
                <th style="width: 30%;">Modul Utama</th>
                <th style="width: 70%;">Deskripsi Operasional</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Otentikasi & RBAC</strong></td>
                <td>Sistem login terproteksi untuk peran Admin dan Staff Keuangan.</td>
            </tr>
            <tr>
                <td><strong>Jurnal Transaksi Kas</strong></td>
                <td>Pencatatan kas masuk dan keluar secara otomatis dengan penomoran unik <code>TRX-YYYYMMDD-XXXX</code> yang terurut <em>ascending</em> (no. 1 dst. dari atas ke bawah).</td>
            </tr>
            <tr>
                <td><strong>Dashboard Keuangan</strong></td>
                <td>Penyajian visual indikator keuangan utama (Total Pemasukan, Total Pengeluaran, Saldo Bersih, serta Grafik Tren).</td>
            </tr>
            <tr>
                <td><strong>Pelaporan & Ekspor</strong></td>
                <td>Fasilitas filter laporan berdasarkan periode rentang tanggal dan pencetakan dokumen resmi ke format Microsoft Excel (.xlsx) dan PDF (.pdf).</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Dokumen Flowchart & Spesifikasi Sistem PosFinance Regional IV Semarang &copy; 2026 PT Pos Indonesia (Persero).
    </div>

</body>
</html>
