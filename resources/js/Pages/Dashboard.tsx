import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Plus,
  BarChart2,
  Lock,
  CheckCircle2,
  Box
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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
    period: 'daily' | 'weekly' | 'monthly' | 'all';
    total_ongkir: number;
    total_asuransi: number;
    net_revenue: number;
    total_transaksi: number;
    today_count: number;
    today_closed_count: number;
    is_today_closed: boolean;
  };
  charts: {
    daily_trends?: TrendItem[];
    weekly_trends?: TrendItem[];
    monthly_trends?: TrendItem[];
    category_breakdown?: ProductBreakdownItem[];
  };
  productBreakdown: ProductBreakdownItem[];
  recentTransactions: Array<{
    id: number;
    nomor_transaksi: string;
    tanggal: string;
    jenis_transaksi: 'pemasukan' | 'pengeluaran';
    nominal: number;
    nominal_ongkir?: number;
    nominal_asuransi?: number;
    net_revenue?: number;
    keterangan: string;
    status?: 'pending' | 'approved' | 'rejected';
    closed_at?: string | null;
    bukti_transaksi?: string | null;
    bukti_transaksi_url?: string | null;
    category?: {
      nama_kategori: string;
    };
  }>;
  filters: {
    period: 'daily' | 'weekly' | 'monthly' | 'all';
  };
}

export default function Dashboard({ summary, charts, productBreakdown, recentTransactions, filters }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const activePeriod = filters?.period || summary?.period || 'monthly';

  // Chart Tab View State (daily, weekly, monthly)
  const [chartTab, setChartTab] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    setIsMounted(true);
    if (activePeriod === 'daily' || activePeriod === 'weekly' || activePeriod === 'monthly') {
      setChartTab(activePeriod);
    }
  }, [activePeriod]);

  const changePeriod = (p: string) => {
    router.get('/dashboard', { period: p }, { preserveState: true, replace: true });
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
    return charts?.monthly_trends || [];
  };

  const activeTrendData = getActiveTrendData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1">{label}</p>
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

  return (
    <DashboardLayout>
      <Head title="Dashboard Financial & Revenue - PosFinance Regional IV" />

      <div className="space-y-8 animate-fadeIn">
        {/* Title Header & Period Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
              Dashboard Pendapatan & Financial Logistik
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              PT Pos Indonesia (Persero) Kantor Regional IV Semarang
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Catat Transaksi
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Pendapatan Ongkir */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pendapatan Ongkir</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatRupiah(summary?.total_ongkir || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Pemasukan Ongkir Layanan Kurir</p>
          </div>

          {/* Card 2: Pengeluaran Asuransi Paket */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pengeluaran Asuransi</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatRupiah(summary?.total_asuransi || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Asuransi Terbayar Paket</p>
          </div>

          {/* Card 3: Pendapatan Bersih (Net Revenue) */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Revenue (Pendapatan Bersih)</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {formatRupiah(summary?.net_revenue || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Ongkir Dikurangi Asuransi</p>
          </div>

          {/* Card 4: Total Transaksi Paket */}
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi Paket</span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
                <Box className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {summary?.total_transaksi || 0} <span className="text-xs font-normal text-slate-500">Paket</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Tercatat Resmi PosFinance</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRAFIK TREN PENDAPATAN & ASURANSI (HARIAN, MINGGUAN, BULANAN) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-orange-500" />
                Grafik Tren Pendapatan & Pengeluaran Asuransi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Perbandingan omset ongkir (hijau) vs biaya asuransi (merah) per periode
              </p>
            </div>

            {/* Interactive Chart Tab Selector */}
            <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setChartTab('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartTab === 'daily'
                    ? 'bg-slate-900 text-white dark:bg-orange-500 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Harian (Tgl 1-31)
              </button>
              <button
                onClick={() => setChartTab('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartTab === 'weekly'
                    ? 'bg-slate-900 text-white dark:bg-orange-500 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mingguan (W1-W5)
              </button>
              <button
                onClick={() => setChartTab('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartTab === 'monthly'
                    ? 'bg-slate-900 text-white dark:bg-orange-500 shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bulanan (Jan-Des)
              </button>
            </div>
          </div>

          <div className="h-[300px] w-full pt-2">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ongkir" name="Ongkir (Pemasukan)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="asuransi" name="Asuransi (Pengeluaran)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
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

        {/* Tabel Rekapitulasi Pendapatan per Jenis Layanan */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="h-4 w-4 text-orange-500" />
                Rekapitulasi Pendapatan per Jenis Layanan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown detail pendapatan ongkir & pengeluaran asuransi untuk setiap layanan kurir (Periode: {activePeriod.toUpperCase()})
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
      </div>
    </DashboardLayout>
  );
}
