import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import LoadingSpinner from '@/Components/LoadingSpinner';
import DateInput from '@/Components/DateInput';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  Filter,
  Eye,
  Download,
  ExternalLink,
  ImageIcon,
  X,
  AlertTriangle,
  Loader2,
  Box
} from 'lucide-react';

interface Transaction {
  id: number;
  nomor_transaksi: string;
  tanggal: string;
  jenis_transaksi: 'pemasukan' | 'pengeluaran';
  kategori_id: number;
  nominal: number;
  nominal_ongkir?: number;
  nominal_asuransi?: number;
  net_revenue?: number;
  keterangan: string | null;
  status: string;
  closed_at?: string | null;
  bukti_transaksi: string | null;
  bukti_transaksi_url: string | null;
  category?: { nama_kategori: string };
}

interface Category {
  id: number;
  nama_kategori: string;
}

interface ProductSummaryItem {
  id?: number;
  nama_kategori: string;
  count: number;
  total_ongkir: number;
  total_asuransi: number;
  net_revenue: number;
}

interface PageProps {
  transactions: Transaction[];
  summary: {
    total_pemasukan: number;
    total_ongkir?: number;
    total_asuransi?: number;
    total_pengeluaran: number;
    saldo: number;
    net_revenue?: number;
    total_item: number;
  };
  productSummary?: ProductSummaryItem[];
  categories: Category[];
  filters: {
    start_date?: string;
    end_date?: string;
    jenis_transaksi?: string;
    kategori_id?: string;
  };
}

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFirstDayOfMonthString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
};

export default function Index() {
  const { transactions, summary, productSummary, categories, filters } = usePage<any>().props as unknown as PageProps;

  const [startDate, setStartDate] = useState(filters.start_date || getFirstDayOfMonthString());
  const [endDate, setEndDate] = useState(filters.end_date || getTodayString());
  const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');

  // Validation & Loading state
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState<'excel' | 'pdf' | null>(null);

  // Proof Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{ url: string; isPdf: boolean; nomor: string } | null>(null);

  const validateRequiredDates = () => {
    if (!startDate || !endDate) {
      setErrorMessage('Wajib mengisikan Tanggal Mulai dan Tanggal Akhir sebelum mengunduh laporan!');
      return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage('Tanggal Mulai tidak boleh lebih besar daripada Tanggal Akhir!');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const applyFilters = () => {
    if (!validateRequiredDates()) return;

    const params: any = {
      start_date: startDate,
      end_date: endDate,
    };
    if (selectedCategory) params.kategori_id = selectedCategory;

    router.get('/dashboard/reports', params, {
      preserveState: true,
      replace: true
    });
  };

  const resetFilters = () => {
    const defaultStart = getFirstDayOfMonthString();
    const defaultEnd = getTodayString();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedCategory('');
    setErrorMessage('');
    router.get('/dashboard/reports', {
      start_date: defaultStart,
      end_date: defaultEnd
    }, { replace: true });
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (selectedCategory) params.append('kategori_id', selectedCategory);
    return params.toString();
  };

  const handleExportExcel = async () => {
    if (!validateRequiredDates() || downloadingFormat !== null) return;
    const query = buildQueryString();
    setDownloadingFormat('excel');
    try {
      const response = await fetch(`/reports/excel?${query}`);
      if (!response.ok) throw new Error('Gagal mengunduh laporan Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-posfinance-${startDate}-sd-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setErrorMessage('Terjadi kesalahan saat mengunduh file Excel.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleExportPdf = async () => {
    if (!validateRequiredDates() || downloadingFormat !== null) return;
    const query = buildQueryString();
    setDownloadingFormat('pdf');
    try {
      const response = await fetch(`/reports/pdf?${query}`);
      if (!response.ok) throw new Error('Gagal mengunduh laporan PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-posfinance-${startDate}-sd-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setErrorMessage('Terjadi kesalahan saat mengunduh file PDF.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const openProofPreview = (trx: Transaction) => {
    if (!trx.bukti_transaksi_url) return;
    const isPdf = trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf');
    setActivePreview({
      url: trx.bukti_transaksi_url,
      isPdf,
      nomor: trx.nomor_transaksi
    });
    setPreviewModalOpen(true);
  };

  const formatDateDdMmYy = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('T')[0].split(' ')[0].split('-');
    if (parts.length === 3) {
      const yy = parts[0].slice(-2);
      return `${parts[2]}/${parts[1]}/${yy}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${yy}`;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <DashboardLayout>
      <Head title="Laporan Keuangan - PosFinance Regional IV Semarang" />

      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">Laporan Keuangan & Rekapitulasi Layanan</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Tentukan periode Tanggal Mulai dan Tanggal Akhir untuk memuat dan mengunduh laporan resmi.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={downloadingFormat !== null}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {downloadingFormat === 'excel' ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Mengunduh Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportPdf}
              disabled={downloadingFormat !== null}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {downloadingFormat === 'pdf' ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Cetak PDF Resmi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Download Progress Indicator Banner */}
        {downloadingFormat !== null && (
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-emerald-500/10 to-amber-500/10 border border-orange-500/30 dark:border-orange-500/40 rounded-xl p-4 text-slate-900 dark:text-slate-100 shadow-lg animate-fadeIn">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-emerald-500 to-amber-500 animate-pulse" />
            <div className="flex items-center gap-3">
              <LoadingSpinner size="md" color={downloadingFormat === 'excel' ? 'emerald' : 'primary'} />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Sedang Mengunduh Laporan {downloadingFormat === 'excel' ? 'Excel (.xlsx)' : 'PDF'}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/20 text-orange-600 dark:text-orange-300 animate-pulse">
                    Memproses File Berukuran Besar...
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Server sedang mengompilasi seluruh data rekapitulasi keuangan untuk periode {formatDateDdMmYy(startDate) || 'terpilih'} s/d {formatDateDdMmYy(endDate) || 'terpilih'}. File akan diunduh secara otomatis setelah proses selesai.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Warning Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-4 flex items-center gap-3 text-rose-600 dark:text-rose-300 text-xs font-semibold shadow-lg">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-500" />
              Filter Periode & Jenis Layanan
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Terapkan Filter
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 tracking-wider">
                MULAI TANGGAL <span className="text-rose-500">*</span>
              </label>
              <DateInput
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-slate-50/70 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1 tracking-wider">
                SAMPAI TANGGAL <span className="text-rose-500">*</span>
              </label>
              <DateInput
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full bg-slate-50/70 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Jenis Layanan / Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 cursor-pointer"
              >
                <option value="">Semua Jenis Layanan</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Pendapatan Ongkir</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.total_ongkir || summary.total_pemasukan)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Total Ongkir Terkumpul</p>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Pengeluaran Asuransi</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatRupiah(summary.total_asuransi || 0)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Biaya Asuransi Paket</p>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pendapatan Bersih (Net Revenue)</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(summary.net_revenue || summary.saldo)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Ongkir - Asuransi</p>
          </div>
        </div>

        {/* Tabel Rekapitulasi per Jenis Layanan */}
        {productSummary && productSummary.length > 0 && (
          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Box className="h-4 w-4 text-orange-500" />
              Rekapitulasi Pendapatan per Jenis Layanan
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                    <th className="py-3 pl-4 pr-2">Jenis Layanan</th>
                    <th className="py-3 px-2 text-center">Jumlah Paket</th>
                    <th className="py-3 px-2 text-right">Ongkir (IDR)</th>
                    <th className="py-3 px-2 text-right">Asuransi (IDR)</th>
                    <th className="py-3 pr-4 pl-2 text-right">Net Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                  {productSummary.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-4 pr-2 font-bold text-slate-900 dark:text-white">{prod.nama_kategori}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700 dark:text-slate-300">{prod.count} Paket</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(prod.total_ongkir)}</td>
                      <td className="py-3 px-2 text-right font-bold text-rose-600 dark:text-rose-400">{formatRupiah(prod.total_asuransi)}</td>
                      <td className="py-3 pr-4 pl-2 text-right font-extrabold text-orange-600 dark:text-orange-400">{formatRupiah(prod.net_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Data Preview Table */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
              Pratinjau Data Jurnal Transaksi
            </h4>
            <span className="text-xs text-slate-500">
              Total: <strong className="text-slate-900 dark:text-white">{summary.total_item}</strong> transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-950/20">
                  <th className="py-3.5 pl-6">No. Transaksi</th>
                  <th className="py-3.5">Tanggal</th>
                  <th className="py-3.5">Jenis Layanan</th>
                  <th className="py-3.5 text-right">Ongkir</th>
                  <th className="py-3.5 text-right">Asuransi</th>
                  <th className="py-3.5 text-right">Net Revenue</th>
                  <th className="py-3.5 pr-6 text-center">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40 text-xs">
                {transactions.map((trx) => {
                  const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;
                  const ongkir = Number((trx.nominal_ongkir && trx.nominal_ongkir > 0) ? trx.nominal_ongkir : (trx.nominal || 0));
                  const asuransi = Number(trx.nominal_asuransi || 0);
                  const net = ongkir - asuransi;

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-6 font-mono font-bold text-slate-900 dark:text-white">{trx.nomor_transaksi}</td>
                      <td className="py-3">{formatDateDdMmYy(trx.tanggal)}</td>
                      <td className="py-3">
                        <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {trx.category?.nama_kategori || '-'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(ongkir)}</td>
                      <td className="py-3 text-right font-bold text-rose-600 dark:text-rose-400">{asuransi > 0 ? formatRupiah(asuransi) : '-'}</td>
                      <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">{formatRupiah(net)}</td>
                      <td className="py-3 pr-6 text-center">
                        {trx.bukti_transaksi_url ? (
                          <button
                            onClick={() => openProofPreview(trx)}
                            className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer"
                          >
                            <Eye className="h-3 w-3 inline" />
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                      Silakan tentukan rentang tanggal untuk menampilkan data transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pratinjau Modal */}
      {previewModalOpen && activePreview && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pratinjau Bukti #{activePreview.nomor}</h3>
              <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-auto max-h-[78vh]">
              {activePreview.isPdf ? (
                <iframe src={activePreview.url} className="w-full h-[70vh] rounded-xl border border-slate-300 shadow-2xl" title="Bukti PDF" />
              ) : (
                <img src={activePreview.url} alt="Bukti Foto" className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl" />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
