import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Eye,
  Download,
  ExternalLink,
  ImageIcon,
  X,
  AlertTriangle
} from 'lucide-react';

interface Transaction {
  id: number;
  nomor_transaksi: string;
  tanggal: string;
  jenis_transaksi: 'pemasukan' | 'pengeluaran';
  kategori_id: number;
  nominal: number;
  keterangan: string | null;
  bukti_transaksi: string | null;
  bukti_transaksi_url: string | null;
  category?: { nama_kategori: string };
}

interface Category {
  id: number;
  nama_kategori: string;
}

interface PageProps {
  transactions: Transaction[];
  summary: {
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo: number;
    total_item: number;
  };
  categories: Category[];
  filters: {
    start_date?: string;
    end_date?: string;
    jenis_transaksi?: string;
    kategori_id?: string;
  };
}

export default function Index() {
  const { transactions, summary, categories, filters } = usePage<any>().props as unknown as PageProps;

  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [selectedType, setSelectedType] = useState(filters.jenis_transaksi || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');

  // Validation state
  const [errorMessage, setErrorMessage] = useState('');

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
    if (selectedType) params.jenis_transaksi = selectedType;
    if (selectedCategory) params.kategori_id = selectedCategory;

    router.get('/dashboard/reports', params, {
      preserveState: true,
      replace: true
    });
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType('');
    setSelectedCategory('');
    setErrorMessage('');
    router.get('/dashboard/reports', {}, { replace: true });
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (selectedType) params.append('jenis_transaksi', selectedType);
    if (selectedCategory) params.append('kategori_id', selectedCategory);
    return params.toString();
  };

  const handleExportExcel = () => {
    if (!validateRequiredDates()) return;
    const query = buildQueryString();
    window.location.href = `/reports/excel?${query}`;
  };

  const handleExportPdf = () => {
    if (!validateRequiredDates()) return;
    const query = buildQueryString();
    window.location.href = `/reports/pdf?${query}`;
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
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Laporan & Rekapitulasi Keuangan</h2>
            <p className="text-slate-400 text-sm">Silakan tentukan periode Tanggal Mulai dan Tanggal Akhir untuk mengunduh laporan.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Ekspor Excel (.xlsx)
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-950/50 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              Cetak PDF
            </button>
          </div>
        </div>

        {/* Validation Warning Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-xs font-semibold shadow-lg animate-fadeIn">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-500" />
              Filter & Periode Laporan
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={applyFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Terapkan Filter
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-orange-500" />
                Mulai Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all ${
                  errorMessage && !startDate
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20'
                    : 'border-slate-800 focus:border-orange-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-orange-500" />
                Sampai Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all ${
                  errorMessage && !endDate
                    ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20'
                    : 'border-slate-800 focus:border-orange-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Jenis Arus Kas
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="">Semua (Pemasukan & Pengeluaran)</option>
                <option value="pemasukan">Pemasukan Kas</option>
                <option value="pengeluaran">Pengeluaran Kas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Pemasukan</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-emerald-400">{formatRupiah(summary.total_pemasukan)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Total pemasukan kas tercatat</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Pengeluaran</span>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-rose-400">{formatRupiah(summary.total_pengeluaran)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Total pengeluaran kas tercatat</p>
          </div>

          {(() => {
            const isPositive = (summary?.saldo || 0) >= 0;
            return (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Saldo Bersih (Net)</span>
                  <div className={`p-2 rounded-xl border ${
                    isPositive
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatRupiah(summary.saldo)}
                </h3>
                <p className={`text-[11px] font-medium mt-1 ${isPositive ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                  {isPositive ? 'Surplus' : 'Defisit'} ({summary.total_item} transaksi)
                </p>
              </div>
            );
          })()}
        </div>

        {/* Live Data Preview Table */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
              Pratinjau Rekapitulasi Data Laporan
            </h4>
            <span className="text-xs text-slate-400">
              Total: <strong className="text-white">{summary.total_item}</strong> transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider bg-slate-950/20">
                  <th className="py-3.5 pl-6">No. Transaksi</th>
                  <th className="py-3.5">Tanggal</th>
                  <th className="py-3.5">Jenis</th>
                  <th className="py-3.5">Kategori</th>
                  <th className="py-3.5">Keterangan</th>
                  <th className="py-3.5 text-center">Bukti</th>
                  <th className="py-3.5 pr-6 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map((trx) => {
                  const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;

                  return (
                    <tr key={trx.id} className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-6 font-mono text-xs font-bold text-white">
                        {trx.nomor_transaksi}
                      </td>
                      <td className="py-3.5 text-xs font-medium text-slate-300">
                        {new Date(trx.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 text-xs">
                        {trx.jenis_transaksi === 'pemasukan' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ArrowUpRight className="h-3 w-3" />
                            Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <ArrowDownLeft className="h-3 w-3" />
                            Pengeluaran
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-block text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/50">
                          {trx.category?.nama_kategori || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs max-w-xs truncate text-slate-300">
                        {trx.keterangan || '-'}
                      </td>
                      <td className="py-3.5 text-center">
                        {trx.bukti_transaksi_url ? (
                          <button
                            onClick={() => openProofPreview(trx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 cursor-pointer"
                          >
                            {isPdf ? (
                              <FileText className="h-3.5 w-3.5 text-rose-400" />
                            ) : (
                              <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
                            )}
                            <Eye className="h-3 w-3 text-slate-400" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600 font-italic">-</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-6 text-right font-bold">
                        {trx.jenis_transaksi === 'pemasukan' ? (
                          <span className="text-emerald-400 text-xs">{formatRupiah(trx.nominal)}</span>
                        ) : (
                          <span className="text-rose-400 text-xs">{formatRupiah(trx.nominal)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
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
      {previewModalOpen && activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                {activePreview.isPdf ? (
                  <FileText className="h-5 w-5 text-rose-400" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-cyan-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">Pratinjau Bukti Transaksi</h3>
                  <p className="text-[11px] font-mono text-slate-400">{activePreview.nomor}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka Tab Baru
                </a>
                <a
                  href={activePreview.url}
                  download
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh
                </a>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-950 flex items-center justify-center overflow-auto max-h-[78vh]">
              {activePreview.isPdf ? (
                <iframe
                  src={activePreview.url}
                  title={`Bukti Transaksi ${activePreview.nomor}`}
                  className="w-full h-[70vh] rounded-xl border border-slate-800 shadow-2xl"
                />
              ) : (
                <img
                  src={activePreview.url}
                  alt={`Bukti Transaksi ${activePreview.nomor}`}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
