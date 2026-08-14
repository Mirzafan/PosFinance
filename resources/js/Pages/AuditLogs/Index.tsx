import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import DateInput from '@/Components/DateInput';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  RotateCcw, 
  Coins, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Activity, 
  Lock, 
  Tag, 
  Monitor, 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditLogItem {
  id: number;
  user_id: number | null;
  user_name: string;
  user_role: string | null;
  action: string;
  module: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface PageProps {
  logs: {
    data: AuditLogItem[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  stats: {
    total_logs: number;
    transaksi_count: number;
    user_count: number;
  };
  filters: {
    search?: string;
    module?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  };
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      role: 'admin' | 'staff';
    };
  };
}

export default function Index() {
  const { logs, stats, filters, auth } = usePage<any>().props as unknown as PageProps;

  const [search, setSearch] = useState(filters.search || '');
  const [moduleFilter, setModuleFilter] = useState(filters.module || '');
  const [actionFilter, setActionFilter] = useState(filters.action || '');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');

  const handleFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.get('/dashboard/audit-logs', {
      search: search || undefined,
      module: moduleFilter || undefined,
      action: actionFilter || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleReset = () => {
    setSearch('');
    setModuleFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    router.get('/dashboard/audit-logs', {}, { preserveState: true, replace: true });
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <Plus className="h-3 w-3 text-emerald-400" />
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <Edit2 className="h-3 w-3 text-amber-400" />
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full">
            <Trash2 className="h-3 w-3 text-rose-400" />
            DELETE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-full">
            <Activity className="h-3 w-3 text-slate-400" />
            {action}
          </span>
        );
    }
  };

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'Transaksi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-md">
            <Coins className="h-3 w-3 text-orange-400" />
            Transaksi
          </span>
        );
      case 'User':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-md">
            <Users className="h-3 w-3 text-purple-400" />
            User
          </span>
        );
      case 'Kategori':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <Tag className="h-3 w-3 text-blue-400" />
            Kategori
          </span>
        );
      case 'Security':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <Lock className="h-3 w-3 text-emerald-400" />
            Security
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-md">
            {mod}
          </span>
        );
    }
  };

  const getRoleBadgeColor = (role?: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'staff':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <DashboardLayout>
      <Head title="Audit Log Logistik & Kurir - PosFinance Regional IV" />

      <div className="space-y-6 animate-fadeIn">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-orange-500" />
              Audit Log & Activity Trail Logistik & Kurir
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                {stats.total_logs} Total Log Recorded
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Rekam jejak kronologis lengkap seluruh transaksi, pengubahan data, dan aktivitas sistem di PosFinance.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Audit Log</span>
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.total_logs}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Total riwayat aktivitas tercatat</p>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log Transaksi</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.transaksi_count}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Aktivitas input & edit transaksi</p>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log Pengguna</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stats.user_count}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Pengelolaan akun pengguna</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 space-y-4 shadow-sm">
          <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari kata kunci, nama user, deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Module Filter */}
            <div>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">Semua Modul</option>
                <option value="Transaksi">Modul Transaksi</option>
                <option value="Kategori">Modul Kategori</option>
                <option value="User">Modul User</option>
                <option value="Security">Modul Security / Auth</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">Semua Aksi</option>
                <option value="CREATE">CREATE (Tambah Data)</option>
                <option value="UPDATE">UPDATE (Edit Data)</option>
                <option value="DELETE">DELETE (Hapus Data)</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Filter & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset Filter"
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/60">
                  <th className="py-3.5 pl-6 pr-3 whitespace-nowrap">Waktu Execution</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Pelaku (User)</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Modul</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Tipe Aksi</th>
                  <th className="py-3.5 px-3 min-w-[280px]">Rincian Deskripsi Log</th>
                  <th className="py-3.5 pr-6 pl-3 text-right whitespace-nowrap">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                {logs.data && logs.data.length > 0 ? (
                  logs.data.map((log) => {
                    const dateObj = new Date(log.created_at);
                    const formattedDate = dateObj.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Waktu & Tanggal */}
                        <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight">{formattedTime} <span className="text-[10px] text-slate-500">WIB</span></p>
                              <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* Pelaku / User */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                              {log.user_name ? log.user_name.charAt(0) : 'S'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-xs">{log.user_name}</p>
                              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full border ${getRoleBadgeColor(log.user_role)}`}>
                                {log.user_role || 'system'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Modul */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getModuleBadge(log.module)}
                        </td>

                        {/* Tipe Aksi */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Deskripsi */}
                        <td className="py-3.5 px-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                          {log.description}
                        </td>

                        {/* IP Address */}
                        <td className="py-3.5 pr-6 pl-3 text-right whitespace-nowrap font-mono text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Monitor className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                            {log.ip_address || '127.0.0.1'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 text-xs">
                      <ShieldCheck className="h-10 w-10 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
                      Tidak ada catatan Audit Log yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{logs.data.length}</span> dari <span className="font-semibold text-slate-900 dark:text-white">{logs.total}</span> data log
              </span>

              <div className="flex items-center gap-1.5">
                {logs.links.map((link, idx) => (
                  <button
                    key={idx}
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      link.active
                        ? 'bg-orange-600 text-white'
                        : link.url
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
