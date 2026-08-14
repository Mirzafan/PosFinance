import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import ForecastSection, { ForecastData } from '@/Components/ForecastSection';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart2,
  PieChart as PieChartIcon,
  CheckCircle2,
  Box,
  Layers,
  Trophy,
  Award,
  Medal,
  Crown,
  Sparkles
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

interface ProductBreakdownItem {
  id: number;
  name: string;
  total_ongkir: number;
  total_asuransi: number;
  net_revenue: number;
  count: number;
  value: number;
}

interface TrendItem {
  label: string;
  key: string;
  ongkir: number;
  asuransi: number;
  net: number;
}

interface DashboardProps {
  summary: {
    period: string;
    total_ongkir: number;
    total_asuransi: number;
    net_revenue: number;
    total_transaksi: number;
    today_count: number;
    today_closed_count: number;
    is_today_closed: boolean;
  };
  charts: {
    daily_trends: Array<{ label: string; key: string; ongkir: number; asuransi: number; net: number }>;
    weekly_trends: Array<{ label: string; key: string; ongkir: number; asuransi: number; net: number }>;
    monthly_trends: Array<{ label: string; key: string; ongkir: number; asuransi: number; net: number }>;
    yearly_trends?: Array<{ label: string; key: string; ongkir: number; asuransi: number; net: number }>;
    all_time_trends?: Array<{ label: string; key: string; ongkir: number; asuransi: number; net: number }>;
    category_breakdown: any[];
  };
  productBreakdown: Array<{
    id: number;
    name: string;
    total_ongkir: number;
    total_asuransi: number;
    net_revenue: number;
    count: number;
    value: number;
  }>;
  serviceLeaderboard?: Array<{
    id: number;
    name: string;
    total_ongkir: number;
    total_asuransi: number;
    net_revenue: number;
    package_count: number;
    avg_per_paket: number;
    market_share: number;
    rank: number;
    badge: string;
    rank_color: string;
  }>;
  recentTransactions: Array<{
    id: number;
    nomor_transaksi: string;
    tanggal: string;
    jenis_transaksi: 'pemasukan' | 'pengeluaran';
    nominal: number;
    nominal_ongkir: number;
    nominal_asuransi: number;
    status: 'pending' | 'approved' | 'rejected';
    category?: { nama_kategori: string };
    user?: { name: string };
  }>;
  filters: {
    period: string;
    forecast_days: number;
  };
  forecasting?: any;
}

const CATEGORY_COLORS = [
  '#ff6600', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6',
  '#14b8a6', '#a855f7', '#f43f5e', '#84cc16', '#6366f1', '#0284c7', '#d97706'
];

export default function Dashboard({ summary, charts, productBreakdown, serviceLeaderboard, recentTransactions, filters, forecasting }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const activePeriod = filters?.period || summary?.period || 'daily';

  // Chart Tab View State (daily, weekly, monthly, yearly, all)
  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('daily');

  useEffect(() => {
    setIsMounted(true);
    if (['daily', 'weekly', 'monthly', 'yearly', 'all'].includes(activePeriod)) {
      setChartTab(activePeriod as any);
    }
  }, [activePeriod]);

  const changePeriod = (p: string) => {
    setChartTab(p as any);
    router.get('/dashboard', { period: p }, { preserveState: true, preserveScroll: true, replace: true });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Get active dataset for trend chart
  const getActiveTrendData = () => {
    if (chartTab === 'daily') return charts?.daily_trends || [];
    if (chartTab === 'weekly') return charts?.weekly_trends || [];
    if (chartTab === 'monthly') return charts?.monthly_trends || [];
    if (chartTab === 'yearly') return charts?.yearly_trends || [];
    if (chartTab === 'all') return charts?.all_time_trends || [];
    return charts?.monthly_trends || [];
  };

  const activeTrendData = getActiveTrendData();

  // Category Pie Data (Includes all categories dynamically from master data)
  const pieData = productBreakdown || [];
  const chartPieData = pieData.map(item => ({
    ...item,
    pie_value: item.total_ongkir > 0 ? item.total_ongkir : 1
  }));
  const totalPieOngkir = pieData.reduce((acc, curr) => acc + curr.total_ongkir, 0);

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold">{formatRupiah(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalPieOngkir > 0 ? ((data.total_ongkir / totalPieOngkir) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-orange-600 dark:text-orange-400 border-b border-slate-200 dark:border-slate-700 pb-1">{data.name}</p>
          <div className="flex items-center justify-between gap-4 pt-0.5">
            <span className="text-slate-500 dark:text-slate-400">Total Ongkir:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(data.total_ongkir)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Jumlah Paket:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.count} Paket</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Pangsa Pasar:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <Head title="Dashboard Financial & Revenue - PosFinance Regional IV" />

      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
              Dashboard Pendapatan & Financial Logistik & Kurir
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              PT Pos Indonesia (Persero) Kantor Regional IV Semarang
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Global Period Filter Tab Selector */}
            <div className="bg-white dark:bg-slate-950 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
              <button
                onClick={() => changePeriod('daily')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  chartTab === 'daily'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => changePeriod('weekly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  chartTab === 'weekly'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => changePeriod('monthly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  chartTab === 'monthly'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => changePeriod('yearly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  chartTab === 'yearly'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tahunan
              </button>
              <button
                onClick={() => changePeriod('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  chartTab === 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Waktu
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Pendapatan Ongkir */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pendapatan Ongkir</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {formatRupiah(summary?.total_ongkir || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Pemasukan Ongkir Layanan Kurir</p>
          </div>

          {/* Card 2: Pengeluaran Asuransi Paket */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pengeluaran Asuransi</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight truncate">
              {formatRupiah(summary?.total_asuransi || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Asuransi Terbayar Paket</p>
          </div>

          {/* Card 3: Pendapatan Bersih (Net Revenue) */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Revenue</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight truncate">
              {formatRupiah(summary?.net_revenue || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Pendapatan Bersih</p>
          </div>

          {/* Card 4: Total Transaksi Paket */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi Paket</span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
                <Box className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {summary?.total_transaksi || 0} <span className="text-xs font-normal text-slate-500">Paket</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Tercatat Resmi PosFinance</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHARTS GRID: TREN BAR CHART + DISTRIBUSI LAYANAN PIE/DONUT CHART */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Chart: Tren Pendapatan & Asuransi */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0 mt-0.5">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Grafik Tren Pendapatan & Asuransi
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Omset ongkir (hijau) vs biaya asuransi (merah)
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[230px] sm:h-[280px] w-full pt-2">
              {isMounted && activeTrendData && activeTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => val >= 1000000 ? `Rp ${(val / 1000000).toFixed(0)}Jt` : `Rp ${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTrendTooltip />} />
                    <Bar dataKey="ongkir" name="Ongkir (Pemasukan)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="asuransi" name="Asuransi (Pengeluaran)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500">
                  <BarChart2 className="h-8 w-8 text-slate-400 mb-2" />
                  <span>Belum ada data grafik untuk periode ini.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Chart: Distribusi Kategori Layanan (Pie / Donut Chart) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-orange-500" />
                Distribusi Layanan Logistik & Kurir
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proporsi omset ongkir per kategori layanan
              </p>
            </div>

            <div className="h-[180px] w-full flex items-center justify-center relative">
              {isMounted && chartPieData && chartPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart style={{ outline: 'none' }}>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={chartPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="pie_value"
                      stroke="none"
                      style={{ outline: 'none' }}
                    >
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-xs text-slate-500">
                  <Layers className="h-8 w-8 text-slate-400 mb-2" />
                  <span>Belum ada distribusi layanan.</span>
                </div>
              )}
            </div>

            {/* Category Share Legend List (Dynamic Master Data Categories) */}
            {pieData && pieData.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {pieData.map((item, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LEADERBOARD LAYANAN TERPOPULER (TOP PERFORMER SERVICES) */}
        {/* ========================================================================= */}
        {serviceLeaderboard && serviceLeaderboard.length > 0 && (
          <div className="bg-white border border-slate-200/80 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-6 transition-all">
            {/* Header Leaderboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-inner group">
                  <Trophy className="h-6 w-6 text-amber-500 transform group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5 flex-wrap tracking-tight">
                    <span>Leaderboard Layanan Logistik & Kurir</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Top Performer
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {chartTab === 'daily' ? 'Hari Ini' : chartTab === 'weekly' ? 'Minggu Ini' : chartTab === 'monthly' ? 'Bulan Ini' : chartTab === 'yearly' ? '5 Tahun Terakhir' : 'Semua Waktu'}
                    </span>
                  </h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Peringkat kontribusi pendapatan ongkir & volume pengiriman per kategori layanan ({chartTab === 'daily' ? 'Hari Ini' : chartTab === 'weekly' ? 'Minggu Ini' : chartTab === 'monthly' ? 'Bulan Ini' : chartTab === 'yearly' ? '5 Tahun Terakhir' : 'Semua Waktu'})
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                <Box className="w-3.5 h-3.5 text-orange-500" />
                <span>Total {serviceLeaderboard.length} Layanan</span>
              </div>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {serviceLeaderboard.slice(0, 3).map((item, idx) => {
                const isGold = idx === 0;
                const isSilver = idx === 1;

                const config = isGold
                  ? {
                      containerBg: 'bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-white dark:from-amber-500/15 dark:via-amber-500/5 dark:to-[#0B101B]',
                      border: 'border-amber-400/50 dark:border-amber-500/40 hover:border-amber-500 shadow-amber-500/5',
                      topLine: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
                      badgeBg: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-amber-500/25',
                      badgeLabel: 'JUARA 1 · GOLD PERFORMER',
                      IconComponent: Crown,
                      rankBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                      revenueColor: 'text-amber-600 dark:text-amber-400',
                      barBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400',
                    }
                  : isSilver
                  ? {
                      containerBg: 'bg-gradient-to-b from-slate-400/10 via-slate-300/5 to-white dark:from-slate-400/15 dark:via-slate-400/5 dark:to-[#0B101B]',
                      border: 'border-slate-300/80 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 shadow-slate-500/5',
                      topLine: 'bg-gradient-to-r from-slate-400 via-zinc-300 to-slate-500',
                      badgeBg: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md shadow-slate-500/20',
                      badgeLabel: 'JUARA 2 · SILVER PERFORMER',
                      IconComponent: Medal,
                      rankBadge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
                      revenueColor: 'text-slate-800 dark:text-slate-200',
                      barBg: 'bg-gradient-to-r from-slate-500 via-slate-400 to-zinc-300',
                    }
                  : {
                      containerBg: 'bg-gradient-to-b from-orange-500/10 via-amber-700/5 to-white dark:from-orange-500/15 dark:via-amber-800/5 dark:to-[#0B101B]',
                      border: 'border-orange-400/40 dark:border-orange-500/40 hover:border-orange-400 shadow-orange-500/5',
                      topLine: 'bg-gradient-to-r from-orange-500 via-amber-600 to-amber-700',
                      badgeBg: 'bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white shadow-md shadow-orange-500/20',
                      badgeLabel: 'JUARA 3 · BRONZE PERFORMER',
                      IconComponent: Award,
                      rankBadge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
                      revenueColor: 'text-orange-600 dark:text-orange-400',
                      barBg: 'bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500',
                    };

                const IconComp = config.IconComponent;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border ${config.border} ${config.containerBg} relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                  >
                    {/* Top Accent Line */}
                    <div className={`h-1.5 w-full ${config.topLine}`} />

                    <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                      {/* Top Header Badge & Rank */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${config.badgeBg}`}>
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{config.badgeLabel}</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${config.rankBadge}`}>
                          #{item.rank}
                        </span>
                      </div>

                      {/* Service Name & Revenue Display */}
                      <div className="space-y-1">
                        <h5 className="font-black text-slate-900 dark:text-white text-lg tracking-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </h5>
                        <div className="pt-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                            Total Pendapatan Ongkir
                          </p>
                          <div className={`text-2xl font-black tracking-tight mt-0.5 ${config.revenueColor}`}>
                            {formatRupiah(item.total_ongkir)}
                          </div>
                        </div>
                      </div>

                      {/* Market Share Progress Bar */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Pangsa Pasar</span>
                          <span className="font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs">
                            {item.market_share}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/40">
                          <div
                            className={`h-full ${config.barBg} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, item.market_share)}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Stat Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                            Volume
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {item.package_count} Paket
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                            Rata-rata
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {formatRupiah(item.avg_per_paket)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabel Rekapitulasi Pendapatan per Jenis Layanan */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="h-4 w-4 text-orange-500" />
                <span>Rekapitulasi Pendapatan per Jenis Layanan Logistik & Kurir</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {chartTab === 'daily' ? 'Harian (Hari Ini)' : chartTab === 'weekly' ? 'Mingguan (Minggu Ini)' : chartTab === 'monthly' ? 'Bulanan (Bulan Ini)' : chartTab === 'yearly' ? 'Tahunan (5 Tahun Terakhir)' : 'Semua Waktu'}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown detail pendapatan ongkir & pengeluaran asuransi untuk setiap layanan kurir ({chartTab === 'daily' ? 'Hari Ini' : chartTab === 'weekly' ? 'Minggu Ini' : 'Bulan Ini'})
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  <th className="py-3 pl-4 pr-2">Jenis Layanan</th>
                  <th className="py-3 px-2 text-center">Jumlah Paket</th>
                  <th className="py-3 px-2 text-right">Ongkir (Pemasukan)</th>
                  <th className="py-3 px-2 text-right">Asuransi (Pengeluaran)</th>
                  <th className="py-3 pr-4 pl-2 text-right">Net Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {productBreakdown && productBreakdown.length > 0 ? (
                  productBreakdown.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-4 pr-2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        {prod.name}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {prod.count} Paket
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(prod.total_ongkir)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatRupiah(prod.total_asuransi)}
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right font-extrabold text-blue-600 dark:text-blue-400">
                        {formatRupiah(prod.net_revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">Belum ada data layanan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Learning Time Series Forecasting Section (Proyeksi Pendapatan & Volume Paket) */}
        {forecasting && <ForecastSection forecasting={forecasting} />}
      </div>
    </DashboardLayout>
  );
}
