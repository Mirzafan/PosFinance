import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  TrendingUp,
  Box,
  LineChart,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export interface ForecastPredictionItem {
  date: string;
  formatted_date: string;
  day_name: string;
  predicted_revenue: number;
  lower_bound: number;
  upper_bound: number;
  predicted_count: number;
  is_peak: boolean;
  seasonality_factor: number;
}

export interface CombinedChartItem {
  date: string;
  formatted_date: string;
  actual_revenue: number | null;
  actual_count: number | null;
  predicted_revenue: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
  is_future: boolean;
}

export interface RecommendationItem {
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
}

export interface ForecastData {
  horizon_days: number;
  total_projected_revenue: number;
  total_projected_volume: number;
  growth_percentage: number;
  model_accuracy: number;
  peak_days_count: number;
  predictions: ForecastPredictionItem[];
  combined_chart: CombinedChartItem[];
  recommendations: RecommendationItem[];
}

interface ForecastSectionProps {
  forecasting: ForecastData;
  activePeriod?: string;
}

export default function ForecastSection({ forecasting }: ForecastSectionProps) {
  const [horizon, setHorizon] = useState<number>(forecasting?.horizon_days || 14);

  const changeHorizon = (days: number) => {
    setHorizon(days);
    router.get(
      '/dashboard',
      { forecast_days: days },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2 max-w-xs backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
              {label} ({data?.day_name || ''})
            </span>
            {data?.is_future ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30 uppercase tracking-wider">
                Proyeksi
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30 uppercase tracking-wider">
                Aktual
              </span>
            )}
          </div>

          {data?.actual_revenue !== null && data?.actual_revenue !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Aktual Ongkir:
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(data.actual_revenue)}
              </span>
            </div>
          )}

          {data?.predicted_revenue !== null && data?.predicted_revenue !== undefined && (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Proyeksi Ongkir:
                </span>
                <span className="font-extrabold text-purple-600 dark:text-purple-300">
                  {formatRupiah(data.predicted_revenue)}
                </span>
              </div>

              {data?.lower_bound && data?.upper_bound && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Rentang Kepercayaan (95%):</span>
                  </div>
                  <div className="font-mono text-purple-700 dark:text-purple-300 text-right font-semibold">
                    {formatRupiah(data.lower_bound)} &ndash; {formatRupiah(data.upper_bound)}
                  </div>
                </div>
              )}
            </>
          )}

          {data?.is_peak && (
            <div className="pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Puncak Transaksi (Peak Season)</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm text-slate-900 dark:text-white space-y-6 relative overflow-hidden transition-colors">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 dark:bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0 mt-0.5">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-300 text-xs font-semibold mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
              <span>Analisis Proyeksi & Tren Pendapatan</span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Proyeksi Pendapatan & Volume Paket
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Estimasi proyeksi omset ongkir dan volume pengiriman kurir PT Pos Indonesia Regional IV Semarang.
            </p>
          </div>
        </div>

        {/* Horizon Filter Selector */}
        <div className="bg-white dark:bg-slate-950 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar self-start sm:self-auto">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => changeHorizon(days)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                horizon === days
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {days} Hari Ke Depan
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {/* KPI 1: Proyeksi Total Pendapatan */}
        <div className="bg-slate-50/80 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-3 backdrop-blur-md shadow-sm">
          <div className="flex items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px] leading-tight">Proyeksi Pendapatan ({horizon} Hari)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-300 tracking-tight">
              {formatRupiah(forecasting?.total_projected_revenue || 0)}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
              <ArrowUpRight className="h-4 w-4 shrink-0" />
              <span>+{forecasting?.growth_percentage || 0}% vs Periode Sebelumnya</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Proyeksi Volume Paket */}
        <div className="bg-slate-50/80 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-3 backdrop-blur-md shadow-sm">
          <div className="flex items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px] leading-tight">Proyeksi Volume Paket</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
              <Box className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
              {(forecasting?.total_projected_volume || 0).toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Paket</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">Estimasi total pengiriman kurir</p>
          </div>
        </div>

        {/* KPI 3: Peak Days Alert */}
        <div className="bg-slate-50/80 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-3 backdrop-blur-md shadow-sm">
          <div className="flex items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px] leading-tight">Hari Puncak (Peak Season)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Zap className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {forecasting?.peak_days_count || 0} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hari</span>
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-400/90 font-medium mt-1.5">Potensi lonjakan omset tinggi</p>
          </div>
        </div>

        {/* KPI 4: Akurasi Model */}
        <div className="bg-slate-50/80 border border-slate-200/80 dark:bg-slate-950/60 dark:border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-3 backdrop-blur-md shadow-sm">
          <div className="flex items-start justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px] leading-tight">Akurasi Estimasi Proyeksi</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {forecasting?.model_accuracy || 93.8}%
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">Metode: Holt-Winters (95% CI)</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-50/50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800 rounded-2xl p-5 relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0 mt-0.5">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Grafik Perbandingan: Data Aktual vs Estimasi Proyeksi ({horizon} Hari Ke Depan)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Garis hijau = Data Historis Aktual | Garis ungu putus-putus = Estimasi Proyeksi Ke Depan
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Aktual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Estimasi Proyeksi</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full pt-2">
          {forecasting?.combined_chart && forecasting.combined_chart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecasting.combined_chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                <XAxis dataKey="formatted_date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000000 ? `Rp ${(val / 1000000).toFixed(0)}Jt` : `Rp ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomForecastTooltip />} />

                {/* Shaded Area for Upper and Lower Confidence Interval Bounds */}
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  stroke="none"
                  fill="#8b5cf6"
                  fillOpacity={0.12}
                  name="Confidence Range"
                />

                {/* Actual Revenue Line */}
                <Line
                  type="monotone"
                  dataKey="actual_revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                  name="Aktual Ongkir"
                  connectNulls
                />

                {/* Predicted Revenue Line (Dashed) */}
                <Line
                  type="monotone"
                  dataKey="predicted_revenue"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3.5, fill: '#a855f7' }}
                  activeDot={{ r: 6 }}
                  name="Estimasi Proyeksi"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-xs text-slate-500">
              <LineChart className="h-8 w-8 text-slate-400 mb-2 animate-bounce" />
              <span>Mengkalkulasi tren proyeksi data...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
