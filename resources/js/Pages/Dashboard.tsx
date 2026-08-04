import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Plus,
  BarChart2,
  PieChart as PieIcon,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  summary: {
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo: number;
    total_transaksi: number;
  };
  charts: {
    monthly_trends: Array<{
      label: string;
      month_key: string;
      pemasukan: number;
      pengeluaran: number;
      net: number;
    }>;
    category_breakdown: Array<{
      name: string;
      value: number;
      jenis_transaksi: string;
    }>;
  };
  recentTransactions: Array<{
    id: number;
    nomor_transaksi: string;
    tanggal: string;
    jenis_transaksi: 'pemasukan' | 'pengeluaran';
    nominal: number;
    keterangan: string;
    status?: 'pending' | 'approved' | 'rejected';
    bukti_transaksi?: string | null;
    bukti_transaksi_url?: string | null;
    category?: {
      nama_kategori: string;
    };
  }>;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

const formatCategoryName = (name: string) => {
  if (!name) return '';
  const upper = name.toUpperCase();
  if (upper === 'POSSAMEDAY') return 'POS SAMEDAY';
  if (upper === 'POSNEXTDAY') return 'POS NEXT DAY';
  if (upper === 'POSREGULER' || upper === 'POSREGULAR') return 'POS REGULAR';
  return name;
};

const getCategoryColor = (name: string, index: number) => {
  const upper = name ? name.toUpperCase() : '';
  if (upper.includes('SAMEDAY')) return '#3b82f6';
  if (upper.includes('NEXTDAY')) return '#10b981';
  if (upper.includes('REGULER') || upper.includes('REGULAR')) return '#f59e0b';
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

export default function Dashboard({ summary, charts, recentTransactions }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Bukti Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{ url: string; isPdf: boolean; nomor: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const openProofPreview = (trx: any) => {
    if (!trx.bukti_transaksi_url) return;
    const isPdf = trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf');
    setActivePreview({
      url: trx.bukti_transaksi_url,
      isPdf,
      nomor: trx.nomor_transaksi
    });
    setPreviewModalOpen(true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0f172a] dark:border-slate-700/80 dark:text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/50 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{formatRupiah(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0f172a] dark:border-slate-700/80 dark:text-slate-100 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">{formatCategoryName(data.name)}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  const categoryData = charts?.category_breakdown && charts.category_breakdown.length > 0
    ? charts.category_breakdown
    : [
        { name: 'POSSAMEDAY', value: 0 },
        { name: 'POSNEXTDAY', value: 0 },
        { name: 'POSREGULER', value: 0 },
      ];

  const hasRealData = categoryData.some(item => item.value > 0);

  const categoryChartData = categoryData.map(item => ({
    ...item,
    chartValue: hasRealData ? (item.value > 0 ? item.value : 0.0001) : 1,
  }));

  return (
    <DashboardLayout>
      <Head title="Dashboard - PosFinance Regional IV Semarang" />

      <div className="space-y-8 animate-fadeIn">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
              Ringkasan Keuangan
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">PT Pos Indonesia - Kantor Regional IV Semarang</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold px-3.5 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Regional IV Semarang</span>
            </div>

            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/20 transition-all duration-150 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Catat Transaksi
            </Link>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Pendapatan Jasa Kurir & Logistik */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pendapatan Layanan</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl lg:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatRupiah(summary?.total_pemasukan || 0)}
              </h3>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Pendapatan Jasa Kurir & Logistik (2026)
              </p>
            </div>
          </div>

          {/* Card 2: Status Kategori Utama */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kategori Layanan Utama</span>
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Pendapatan Jasa Kurir & Logistik
              </h3>
              <p className="text-[11px] text-orange-600/90 dark:text-orange-400/90 font-medium">
                POSSAMEDAY, POSNEXTDAY, & POSREGULER
              </p>
            </div>
          </div>

          {/* Card 3: Total Transaksi Pendapatan */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Transaksi Layanan</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {summary?.total_transaksi || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Transaksi</span>
              </h3>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 font-medium">
                Tercatat resmi PosFinance
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section (Monthly Trends Chart + Distribusi Kategori) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grafik Tren (Bar Chart) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-orange-500" />
                  Grafik Tren Pendapatan Jasa Kurir & Logistik (2026)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pertumbuhan omset pendapatan layanan kurir & logistik per bulan</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Pendapatan Layanan
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full flex items-center justify-center">
              {isMounted && charts?.monthly_trends && charts.monthly_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.monthly_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="pemasukan"
                      name="Pendapatan"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full flex flex-col items-center justify-center text-slate-500 space-y-2 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950/20">
                  <BarChart2 className="h-8 w-8 text-slate-400 dark:text-slate-600/60 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Belum Ada Data Pendapatan</span>
                  <span className="text-[11px] text-slate-500 text-center max-w-xs">Data grafik tren akan otomatis muncul setelah transaksi pendapatan dicatat.</span>
                </div>
              )}
            </div>
          </div>

          {/* Distribusi Kategori (Donut Chart Card) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-start gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                  <PieIcon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    Distribusi Kategori
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Proporsi nominal per kategori keuangan
                  </p>
                </div>
              </div>

              <div className="h-[210px] w-full flex items-center justify-center relative my-2">
                {isMounted && categoryData && categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="chartValue"
                        stroke="none"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, index)} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/20">
                    <PieIcon className="h-7 w-7 text-slate-400 dark:text-slate-600/60 stroke-[1.5]" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Belum Ada Data Kategori</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Legend */}
            {categoryData && categoryData.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 gap-y-2.5 gap-x-4">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(item.name, index) }}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {formatCategoryName(item.name)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section (Recent Transactions Table with Status & Proof Preview) */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-500" />
                Transaksi Terbaru
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">5 transaksi arus kas terakhir yang dicatat dalam sistem</p>
            </div>

            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
            >
              Lihat Semua Transaksi
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  <th className="py-3 pl-4 pr-4 whitespace-nowrap">No. Transaksi</th>
                  <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                  <th className="py-3 px-4 whitespace-nowrap">Kategori</th>
                  <th className="py-3 px-4 min-w-[160px]">Keterangan</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Bukti Transaksi</th>
                  <th className="py-3 pr-4 pl-4 text-right whitespace-nowrap">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                {recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((trx) => {
                    const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;

                    return (
                      <tr key={trx.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-4 pr-4 font-mono text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {trx.nomor_transaksi}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(trx.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                            {trx.category?.nama_kategori || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {trx.keterangan || '-'}
                        </td>
                        {/* Bukti Transaksi Column */}
                        <td className="py-3.5 text-center">
                          {trx.bukti_transaksi_url ? (
                            <button
                              onClick={() => openProofPreview(trx)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 border transition-all hover:scale-105 cursor-pointer"
                              title="Lihat Pratinjau Bukti"
                            >
                              {isPdf ? (
                                <>
                                  <FileText className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                                  <span>PDF</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                  <span>Foto</span>
                                </>
                              )}
                              <Eye className="h-3 w-3 text-slate-400 ml-0.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-600 font-italic">-</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-right font-bold">
                          {trx.jenis_transaksi === 'pemasukan' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs inline-flex items-center">
                              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                              {formatRupiah(trx.nominal)}
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 text-xs inline-flex items-center">
                              <ArrowDownLeft className="h-3.5 w-3.5 mr-0.5" />
                              {formatRupiah(trx.nominal)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Receipt className="h-6 w-6 text-slate-400 dark:text-slate-600/60" />
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Belum ada transaksi tercatat</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-600">Gunakan tombol "Catat Transaksi" untuk menambahkan data arus kas baru.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRATINJAU BUKTI TRANSAKSI MODAL (DASHBOARD) */}
      {/* ========================================================================= */}
      {previewModalOpen && activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
              <div className="flex items-center gap-2">
                {activePreview.isPdf ? (
                  <FileText className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pratinjau Bukti Transaksi</h3>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{activePreview.nomor}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
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
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-auto max-h-[78vh]">
              {activePreview.isPdf ? (
                <iframe
                  src={activePreview.url}
                  title={`Bukti Transaksi ${activePreview.nomor}`}
                  className="w-full h-[70vh] rounded-xl border border-slate-300 dark:border-slate-800 shadow-2xl"
                />
              ) : (
                <img
                  src={activePreview.url}
                  alt={`Bukti Transaksi ${activePreview.nomor}`}
                  className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-300 dark:border-slate-800"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
