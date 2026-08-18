import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  Filter,
  Search,
  UserCheck,
  Coins,
  ShieldCheck,
  Plus,
  X,
  FileCheck2,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';

interface ClosingItem {
  id: string | number;
  closing_id?: number | null;
  tanggal: string;
  formatted_tanggal: string;
  day_name: string;
  formatted_time: string;
  log_type: 'auto_open' | 'close' | 'emergency_open';
  log_title: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  total_transaksi: number;
  user_id?: number | null;
  user_name: string;
  user_role?: string;
  status_lock: boolean;
  status_badge: string;
  catatan?: string;
}

interface KasStatus {
  status: 'open' | 'closed';
  mode: 'auto_open' | 'auto_closed' | 'manual_closed' | 'emergency_open';
  is_locked: boolean;
  label: string;
  description: string;
  today_closing_id?: number | null;
  is_outside_hours: boolean;
  today_date: string;
  today_raw_date: string;
}

interface SummaryData {
  total_kas_terkunci: number;
  total_closing_days: number;
  today_closed: boolean;
  today_closing_id?: number | null;
  today_date: string;
  today_raw_date?: string;
  is_outside_hours?: boolean;
  kas_status?: KasStatus;
}

interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      role: 'admin' | 'staff';
    };
  };
  closings: ClosingItem[];
  summary: SummaryData;
  filters: {
    month: number;
    year: number;
    month_name: string;
    search: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function DailyClosingsIndex() {
  const props = usePage<any>().props as unknown as PageProps;
  const { auth, closings, summary, filters, flash } = props;
  const isAdmin = auth.user.role === 'admin';
  const kasStatus = summary.kas_status;

  const [selectedMonth, setSelectedMonth] = useState<number>(filters.month);
  const [selectedYear, setSelectedYear] = useState<number>(filters.year);
  const [search, setSearch] = useState<string>(filters.search || '');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [itemToUnlock, setItemToUnlock] = useState<ClosingItem | null>(null);

  const handleOpenUnlockModal = (item: ClosingItem) => {
    setItemToUnlock(item);
    setUnlockModalOpen(true);
  };

  const handleExecuteUnlock = () => {
    if (!itemToUnlock) return;
    router.delete(`/dashboard/daily-closings/${itemToUnlock.id}`, {
      onSuccess: () => {
        setUnlockModalOpen(false);
        setItemToUnlock(null);
      },
    });
  };

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    tanggal: new Date().toISOString().split('T')[0],
    catatan: '',
  });

  const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const yearOptions = [2024, 2025, 2026, 2027, 2028];

  const handleFilterChange = (m: number, y: number, s: string) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    router.get(
      '/dashboard/daily-closings',
      { month: m, year: y, search: s },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange(selectedMonth, selectedYear, search);
  };

  const handleQuickCloseToday = () => {
    router.post('/dashboard/daily-closings', {
      tanggal: summary.today_raw_date || new Date().toISOString().split('T')[0],
      catatan: 'Penutupan Kas Harian (Closing)',
    });
  };

  const handleQuickEmergencyOpenToday = () => {
    router.post('/dashboard/daily-closings/emergency-open', {
      tanggal: summary.today_raw_date || new Date().toISOString().split('T')[0],
    });
  };

  const openProcessClosingModal = () => {
    clearErrors();
    setData({
      tanggal: new Date().toISOString().split('T')[0],
      catatan: '',
    });
    setShowModal(true);
  };

  const handleSubmitClosing = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/daily-closings', {
      onSuccess: () => {
        setShowModal(false);
        reset();
      },
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <DashboardLayout>
      <Head title="Penutupan Kas Harian (Daily Closing)" />

      <div className="space-y-6">
        {/* Flash Message Banner */}
        {flash?.success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{flash.success}</span>
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{flash.error}</span>
            </div>
          </div>
        )}

        {/* Status Kas Hari Ini Card */}
        <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0B101B] dark:border-[#182232] dark:text-white rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span>Status Kas Hari Ini ({summary.today_date})</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Dynamic Status Badge */}
              {kasStatus?.status === 'open' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold text-sm shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Kas Buka 🔓</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-extrabold text-sm shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Kas Ditutup 🔒</span>
                </div>
              )}

              {/* Manual Emergency Action Buttons (Admin Only) */}
              {isAdmin && (
                kasStatus?.status === 'closed' ? (
                  <button
                    onClick={handleQuickEmergencyOpenToday}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Buka Kas Hari Ini</span>
                  </button>
                ) : (
                  <button
                    onClick={handleQuickCloseToday}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Tutup Kas Hari Ini (Closing)</span>
                  </button>
                )
              )}
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Jam Buka 07.00 Pagi – Tutup 17.00 Sore
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {kasStatus?.description || 'Otomatis mengikuti jam operasional kasir & penguncian admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Process Daily Closing Modal (Portaled to document.body) */}
        {showModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Proses Penutupan Kas Harian
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Penguncian transaksi kasir PT Pos Indonesia
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitClosing} className="space-y-5">
                {/* Select Tanggal Closing */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Tanggal Penutupan Kas</span>
                    <span className="text-[10px] text-slate-400 font-normal">*Wajib diisi</span>
                  </label>
                  <input
                    type="date"
                    value={data.tanggal}
                    onChange={(e) => setData('tanggal', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-sm transition-all"
                  />
                  {errors.tanggal && <p className="text-[11px] text-rose-500 font-medium">{errors.tanggal}</p>}
                </div>

                {/* Catatan / Keterangan Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Catatan Kasir / Berita Acara (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Seluruh transaksi fisik uang tunai & transfer telah cocok dengan saldo kasir."
                    value={data.catatan}
                    onChange={(e) => setData('catatan', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium rounded-2xl p-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none shadow-sm transition-all"
                  />
                  {errors.catatan && <p className="text-[11px] text-rose-500 font-medium">{errors.catatan}</p>}
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>Perhatian Penguncian Transaksi:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Setelah proses penutupan kas dilakukan, seluruh transaksi pada tanggal tersebut akan **dikunci (Locked)** dan diterbitkan Berita Acara PDF resmi.
                  </p>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-extrabold shadow-md shadow-orange-600/20 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {processing ? 'Memproses...' : 'Proses & Kunci Kas 🔒'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Unlock Confirmation Modal (Portaled to document.body) */}
        {unlockModalOpen && itemToUnlock && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative text-center">
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/20">
                <Unlock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Buka Kunci Penutupan Kas?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin membuka kunci kas harian tanggal <span className="font-extrabold text-slate-900 dark:text-white">{itemToUnlock.formatted_tanggal}</span>?
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left text-amber-700 dark:text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Dampak Pembukaan Kunci:</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Transaksi pada tanggal ini akan **terbuka kembali** sehingga Staff/Admin dapat menambah, mengubah, atau menghapus catatan transaksi harian tersebut.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnlockModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteUnlock}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Ya, Buka Kunci 🔓</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </DashboardLayout>
  );
}
