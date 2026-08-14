import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Calendar,
  Filter,
  Layers,
  Coins,
  Edit3,
  X,
  Info
} from 'lucide-react';

interface CategoryTargetItem {
  category_id: number;
  category_name: string;
  target_nominal: number;
  actual_nominal: number;
  percentage: number;
  status: 'tercapai' | 'hampir_tercapai' | 'perlu_ditingkatkan';
  transaction_count: number;
  keterangan: string;
}

interface SummaryData {
  total_target: number;
  total_actual: number;
  percentage: number;
  status: 'tercapai' | 'hampir_tercapai' | 'perlu_ditingkatkan';
  tercapai_count: number;
  hampir_tercapai_count: number;
  perlu_ditingkatkan_count: number;
}

interface Category {
  id: number;
  nama_kategori: string;
}

interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      role: 'admin' | 'staff';
    };
  };
  categoryTargets: CategoryTargetItem[];
  summary: SummaryData;
  filters: {
    month: number;
    year: number;
    month_name: string;
  };
  categories: Category[];
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function TargetsIndex() {
  const props = usePage<any>().props as unknown as PageProps;
  const { auth, categoryTargets, summary, filters, categories, flash } = props;
  const isAdmin = auth.user.role === 'admin';

  const [selectedMonth, setSelectedMonth] = useState<number>(filters.month);
  const [selectedYear, setSelectedYear] = useState<number>(filters.year);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTargetItem | null>(null);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    kategori_id: '',
    bulan: filters.month,
    tahun: filters.year,
    target_nominal: '',
    keterangan: '',
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

  const handleFilterChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    router.get(
      '/dashboard/targets',
      { month: m, year: y },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const openSetTargetModal = (item?: CategoryTargetItem) => {
    clearErrors();
    if (item) {
      setEditingCategory(item);
      setData({
        kategori_id: String(item.category_id),
        bulan: selectedMonth,
        tahun: selectedYear,
        target_nominal: String(item.target_nominal),
        keterangan: item.keterangan || '',
      });
    } else {
      setEditingCategory(null);
      setData({
        kategori_id: categories.length > 0 ? String(categories[0].id) : '',
        bulan: selectedMonth,
        tahun: selectedYear,
        target_nominal: '',
        keterangan: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/targets', {
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

  const getStatusBadge = (status: 'tercapai' | 'hampir_tercapai' | 'perlu_ditingkatkan', pct: number) => {
    if (status === 'tercapai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Tercapai ({pct}%)</span>
        </span>
      );
    }
    if (status === 'hampir_tercapai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Hampir Tercapai ({pct}%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30">
        <XCircle className="h-3.5 w-3.5" />
        <span>Perlu Ditingkatkan ({pct}%)</span>
      </span>
    );
  };

  const getProgressBarColor = (status: 'tercapai' | 'hampir_tercapai' | 'perlu_ditingkatkan') => {
    if (status === 'tercapai') return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (status === 'hampir_tercapai') return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    return 'bg-gradient-to-r from-rose-500 to-pink-500';
  };

  return (
    <DashboardLayout>
      <Head title="Target Pendapatan Logistik & Kurir - PosFinance Regional IV" />

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

        {/* Page Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold mb-2">
              <Target className="h-3.5 w-3.5" />
              <span>Management & Budgeting Regional IV</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              Target Pendapatan Bulanan Logistik & Kurir
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Monitoring realisasi omset ongkir vs target bulanan per kategori layanan Logistik & Kurir PT Pos Indonesia Regional IV Semarang.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => openSetTargetModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Set Target Bulanan</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar (Month & Year) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:px-5 shadow-sm transition-colors">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Filter className="h-4 w-4" />
            </div>
            <span>Periode Data Target:</span>
            <span className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-wide bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              {filters.month_name} {filters.year}
            </span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Month Select */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => handleFilterChange(Number(e.target.value), selectedYear)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl pl-3 pr-8 py-2 min-w-[130px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-sm transition-all"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(selectedMonth, Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl pl-3 pr-8 py-2 min-w-[95px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-sm transition-all"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Regional Hero Progress Banner */}
        <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0B101B] dark:border-[#182232] dark:text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6 transition-colors">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Total Pencapaian Regional IV ({filters.month_name} {filters.year})
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                {formatRupiah(summary.total_actual)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dari target nominal regional sebesar <span className="font-bold text-slate-900 dark:text-slate-200">{formatRupiah(summary.total_target)}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(summary.status, summary.percentage)}
            </div>
          </div>

          {/* Large Overall Progress Bar */}
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Progres Pencapaian Overall</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">{summary.percentage}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(summary.status)}`}
                style={{ width: `${Math.min(100, summary.percentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Performance Summary Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <span>Total Kategori</span>
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {categoryTargets.length} <span className="text-xs font-normal text-slate-500">Layanan</span>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <span>Target Tercapai</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.tercapai_count} <span className="text-xs font-normal text-slate-500">Kategori</span>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <span>Hampir Tercapai</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary.hampir_tercapai_count} <span className="text-xs font-normal text-slate-500">Kategori</span>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <span>Perlu Ditingkatkan</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {summary.perlu_ditingkatkan_count} <span className="text-xs font-normal text-slate-500">Kategori</span>
            </h3>
          </div>
        </div>

        {/* Category Target Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-orange-500" />
              Detail Target per Layanan Logistik & Kurir ({filters.month_name} {filters.year})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categoryTargets.map((item) => (
              <div
                key={item.category_id}
                className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm space-y-4 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20">
                        Layanan POS
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {item.category_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status, item.percentage)}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openSetTargetModal(item)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all cursor-pointer"
                          title="Edit Target"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nominal Comparison */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Realisasi Ongkir</span>
                      <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {formatRupiah(item.actual_nominal)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Target Bulanan</span>
                      <p className="text-base font-black text-orange-600 dark:text-orange-400 mt-0.5">
                        {formatRupiah(item.target_nominal)}
                      </p>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Pencapaian:</span>
                      <span className="text-slate-900 dark:text-white font-mono">{item.percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(item.status)}`}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {item.keterangan && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span>{item.keterangan}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Total Transaksi Disetujui:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.transaction_count} Transaksi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Set Target Modal (Admin Only) */}
        {showModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {editingCategory ? 'Edit Target Pendapatan' : 'Set Target Pendapatan'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Periode Target: <span className="font-bold text-orange-600 dark:text-orange-400">{filters.month_name} {selectedYear}</span>
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
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Select Kategori */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Kategori Layanan Kurir</span>
                    <span className="text-[10px] text-slate-400 font-normal">*Wajib dipilih</span>
                  </label>
                  <select
                    value={data.kategori_id}
                    onChange={(e) => setData('kategori_id', e.target.value)}
                    disabled={!!editingCategory}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-60 cursor-pointer shadow-sm transition-all"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {errors.kategori_id && <p className="text-[11px] text-rose-500 font-medium">{errors.kategori_id}</p>}
                </div>

                {/* Target Nominal Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Target Nominal Ongkir (Rp)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Format Otomatis Titik</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-black text-xs select-none">
                      Rp
                    </div>
                    <input
                      type="text"
                      placeholder="50.000.000"
                      value={data.target_nominal ? new Intl.NumberFormat('id-ID').format(Number(data.target_nominal)) : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setData('target_nominal', raw);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-2xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm transition-all"
                    />
                  </div>
                  {data.target_nominal && !isNaN(Number(data.target_nominal)) && Number(data.target_nominal) > 0 && (
                    <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400 flex items-center justify-between shadow-inner">
                      <span className="font-semibold text-[11px]">Terbaca (Rupiah):</span>
                      <span className="font-black text-sm">{formatRupiah(Number(data.target_nominal))}</span>
                    </div>
                  )}
                  {errors.target_nominal && <p className="text-[11px] text-rose-500 font-medium">{errors.target_nominal}</p>}
                </div>

                {/* Keterangan Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Catatan / Keterangan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Target ditingkatkan 15% menjelang peak season Ramadhan"
                    value={data.keterangan}
                    onChange={(e) => setData('keterangan', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium rounded-2xl p-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none shadow-sm transition-all"
                  />
                  {errors.keterangan && <p className="text-[11px] text-rose-500 font-medium">{errors.keterangan}</p>}
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
                    {processing ? 'Menyimpan...' : 'Simpan Target'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </DashboardLayout>
  );
}
