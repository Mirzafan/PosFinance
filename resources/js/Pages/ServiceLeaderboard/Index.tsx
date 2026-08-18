import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  TrendingUp,
  PackageCheck,
  Coins,
  Filter,
  ArrowUpDown,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

interface LeaderboardItem {
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
  rank_color: 'amber' | 'slate' | 'orange' | 'blue';
}

interface SummaryData {
  total_system_revenue: number;
  total_system_packages: number;
  total_categories: number;
}

interface Filters {
  period: string;
  sort_by: string;
}

interface PageProps {
  leaderboard: LeaderboardItem[];
  topCategory: LeaderboardItem | null;
  summary: SummaryData;
  filters: Filters;
}

export default function Index({ leaderboard, topCategory, summary, filters }: PageProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handlePeriodChange = (period: string) => {
    router.get('/dashboard/leaderboard', { period, sort_by: filters.sort_by }, { preserveState: true, replace: true });
  };

  const handleSortChange = (sortBy: string) => {
    router.get('/dashboard/leaderboard', { period: filters.period, sort_by: sortBy }, { preserveState: true, replace: true });
  };

  // Top 3 Podium
  const rank1 = leaderboard.find((item) => item.rank === 1);
  const rank2 = leaderboard.find((item) => item.rank === 2);
  const rank3 = leaderboard.find((item) => item.rank === 3);

  return (
    <DashboardLayout>
      <Head title="Leaderboard Layanan Kurir - PosFinance Regional IV" />

      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <span>Leaderboard & Peringkat Layanan Kurir</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Analisis peringkat kontribusi omset & volume paket terbanyak PT Pos Indonesia Regional IV Semarang.
            </p>
          </div>

          {/* Quick Summary Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl px-4 py-2 shadow-sm text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Layanan</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{summary.total_categories} Kategori</span>
            </div>
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl px-4 py-2 shadow-sm text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Omset Netto</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.total_system_revenue)}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-4 sm:px-5 shadow-sm transition-colors">
          {/* Period Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline">Periode:</span>
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'weekly', label: 'Minggu Ini' },
              { id: 'monthly', label: 'Bulan Ini' },
              { id: 'yearly', label: 'Tahun Ini' },
              { id: 'all', label: 'Semua Waktu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handlePeriodChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filters.period === tab.id
                    ? 'bg-orange-600 text-white dark:bg-orange-500 shadow-md shadow-orange-600/30'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Urutkan:</span>
            <button
              onClick={() => handleSortChange('revenue')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.sort_by === 'revenue'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>Omset Terbanyak</span>
            </button>
            <button
              onClick={() => handleSortChange('volume')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.sort_by === 'volume'
                  ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/30'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Volume Paket</span>
            </button>
          </div>
        </div>

        {/* TOP 3 PODIUM CARDS */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rank 2 (Silver) */}
            {rank2 ? (
              <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0B101B] dark:border-[#182232] dark:text-white rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden transition-colors flex flex-col justify-between order-2 md:order-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-base flex items-center justify-center border border-slate-300 dark:border-slate-700 shadow-inner">
                      2
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Silver Performer</span>
                      <h4 className="text-lg font-black tracking-tight">{rank2.name}</h4>
                    </div>
                  </div>
                  <Medal className="h-7 w-7 text-slate-400 shrink-0" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Pendapatan Netto:</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">{formatRupiah(rank2.net_revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Jumlah Transaksi:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rank2.package_count} Paket</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pangsa Pasar:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{rank2.market_share}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rank2.market_share)}%` }} />
                </div>
              </div>
            ) : null}

            {/* Rank 1 (Gold - Main Winner) */}
            {rank1 ? (
              <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 text-slate-900 dark:text-white rounded-3xl p-6 shadow-lg shadow-amber-500/10 space-y-4 relative overflow-hidden transition-colors flex flex-col justify-between order-1 md:order-2 scale-[1.02]">
                <div className="absolute top-0 right-0 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Top #1 Performer</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300">
                      1
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 inline" /> Gold Champion
                      </span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{rank1.name}</h3>
                    </div>
                  </div>
                  <Trophy className="h-9 w-9 text-amber-500 shrink-0 animate-bounce" />
                </div>

                <div className="space-y-2.5 pt-2 bg-amber-500/10 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Omset Netto:</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{formatRupiah(rank1.net_revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Volume Paket:</span>
                    <span className="font-black text-slate-900 dark:text-white">{rank1.package_count} Paket</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Kontribusi Pasar:</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{rank1.market_share}% dari Total Sistem</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rank1.market_share)}%` }} />
                </div>
              </div>
            ) : null}

            {/* Rank 3 (Bronze) */}
            {rank3 ? (
              <div className="bg-white border border-slate-200 text-slate-900 dark:bg-[#0B101B] dark:border-[#182232] dark:text-white rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden transition-colors flex flex-col justify-between order-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-base flex items-center justify-center border border-orange-500/20">
                      3
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">Bronze Performer</span>
                      <h4 className="text-lg font-black tracking-tight">{rank3.name}</h4>
                    </div>
                  </div>
                  <Award className="h-7 w-7 text-orange-500 shrink-0" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Pendapatan Netto:</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">{formatRupiah(rank3.net_revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Jumlah Transaksi:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rank3.package_count} Paket</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pangsa Pasar:</span>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400">{rank3.market_share}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rank3.market_share)}%` }} />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* FULL LEADERBOARD TABLE */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                <span>Tabel Lengkap Peringkat Layanan Kurir</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Peringkat seluruh produk kurir terdaftar berdasarkan akumulasi pendapatan dan volume transaksi.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4 text-center w-14">Rank</th>
                  <th className="py-3.5 px-4">Nama Layanan Kurir</th>
                  <th className="py-3.5 px-4 text-right">Pendapatan Ongkir</th>
                  <th className="py-3.5 px-4 text-right">Pengeluaran Asuransi</th>
                  <th className="py-3.5 px-4 text-right">Pendapatan Netto</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Paket</th>
                  <th className="py-3.5 px-4 text-right">Rata-rata/Paket</th>
                  <th className="py-3.5 px-4 text-center w-40">Kontribusi Pasar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4 text-center">
                        {item.rank === 1 ? (
                          <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm inline-flex items-center justify-center shadow-md shadow-amber-500/20">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-sm inline-flex items-center justify-center">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black text-sm inline-flex items-center justify-center border border-orange-500/30">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-extrabold text-sm">
                            #{item.rank}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.badge}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(item.total_ongkir)}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatRupiah(item.total_asuransi)}
                      </td>

                      <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatRupiah(item.net_revenue)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200">
                          {item.package_count} Paket
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-slate-600 dark:text-slate-400">
                        {formatRupiah(item.avg_per_paket)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-extrabold">
                            <span className="text-orange-600 dark:text-orange-400">{item.market_share}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, item.market_share)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      <Layers className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum Ada Data Transaksi</p>
                      <p className="text-xs mt-1">Belum ada transaksi approved pada periode ini.</p>
                    </td>
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
