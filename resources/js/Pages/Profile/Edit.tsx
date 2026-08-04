import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import {
  User as UserIcon,
  ShieldCheck,
  Building2,
  Receipt,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  Download,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Key,
  UserCheck,
  Calendar
} from 'lucide-react';

interface Transaction {
  id: number;
  nomor_transaksi: string;
  tanggal: string;
  jenis_transaksi: 'pemasukan' | 'pengeluaran';
  nominal: number;
  keterangan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  bukti_transaksi_url: string | null;
  category?: { nama_kategori: string };
}

interface FinancialStats {
  total_input: number;
  total_pemasukan: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
}

interface PageProps {
  mustVerifyEmail: boolean;
  status?: string;
  financialStats: FinancialStats;
  personalTransactions: Transaction[];
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      role: 'admin' | 'staff';
      created_at: string;
    };
  };
}

export default function Edit() {
  const { auth, mustVerifyEmail, status, financialStats, personalTransactions } = usePage<any>().props as unknown as PageProps;
  const user = auth.user;

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  // Bukti Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{ url: string; isPdf: boolean; nomor: string } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
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

  const roleLabelMap = {
    admin: { label: 'Administrator Utama', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    staff: { label: 'Staff Keuangan', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  };

  const roleBadge = roleLabelMap[user.role] || roleLabelMap['staff'];

  return (
    <DashboardLayout>
      <Head title={`Profil Keuangan - ${user.name}`} />

      <div className="space-y-6 animate-fadeIn">
        {/* User Identity Header Card */}
        <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              {/* Avatar Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-xl shadow-orange-950/25 shrink-0 border border-orange-400/30">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user.email}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                    PT Pos Indonesia - Kantor Regional IV Semarang
                  </span>
                  {user.created_at && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Receipt className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                Ringkasan Keuangan
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Key className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                Pengaturan Akun
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: RINGKASAN KEUANGAN PENGGUNA */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Financial Contribution Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Total Input Transaksi */}
              <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pencatatan</span>
                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                    <Receipt className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {financialStats.total_input} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Transaksi</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Diinput oleh akun ini dalam sistem
                  </p>
                </div>
              </div>

              {/* Card 2: Total Pendapatan Retail */}
              <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Pendapatan Retail</span>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatRupiah(financialStats.total_pemasukan)}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" /> Total akumulasi pemasukan retail
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Transaction History Table */}
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 relative overflow-hidden space-y-4 shadow-sm">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-orange-500" />
                  Riwayat Pencatatan Transaksi Anda
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar 10 transaksi arus kas terbaru yang diinput oleh akun ini</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                      <th className="py-3 pl-4 pr-2 whitespace-nowrap">No. Transaksi</th>
                      <th className="py-3 px-2 whitespace-nowrap">Tanggal</th>
                      <th className="py-3 px-2 whitespace-nowrap">Jenis</th>
                      <th className="py-3 px-2 whitespace-nowrap">Kategori</th>
                      <th className="py-3 px-2 whitespace-nowrap">Status</th>
                      <th className="py-3 px-2 min-w-[150px]">Keterangan</th>
                      <th className="py-3 px-2 text-right whitespace-nowrap">Nominal</th>
                      <th className="py-3 pr-4 pl-2 text-center whitespace-nowrap">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                    {personalTransactions && personalTransactions.length > 0 ? (
                      personalTransactions.map((trx) => {
                        const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;

                        return (
                          <tr key={trx.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 pl-4 pr-2 font-mono text-[11px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {trx.nomor_transaksi}
                            </td>
                            <td className="py-3 px-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {new Date(trx.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-3 px-2 text-xs whitespace-nowrap">
                              {trx.jenis_transaksi === 'pemasukan' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  Pemasukan
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                  <ArrowDownLeft className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                  Pengeluaran
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              <span className="inline-block text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                                {trx.category?.nama_kategori || '-'}
                              </span>
                            </td>
                            {/* Status Persetujuan Column */}
                            <td className="py-3 px-2 text-xs whitespace-nowrap">
                              {trx.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  Disetujui
                                </span>
                              ) : trx.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                  Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                                  <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                  Ditolak
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-xs max-w-[150px] truncate text-slate-700 dark:text-slate-300">
                              {trx.keterangan || '-'}
                            </td>
                            <td className="py-3 px-2 text-right font-bold whitespace-nowrap">
                              {trx.jenis_transaksi === 'pemasukan' ? (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs inline-flex items-center">
                                  {formatRupiah(trx.nominal)}
                                </span>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400 text-xs inline-flex items-center">
                                  {formatRupiah(trx.nominal)}
                                </span>
                              )}
                            </td>
                            {/* Bukti Transaksi Column */}
                            <td className="py-3 pr-4 pl-2 text-center whitespace-nowrap">
                              {trx.bukti_transaksi_url ? (
                                <button
                                  onClick={() => openProofPreview(trx)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 border transition-all cursor-pointer"
                                  title="Lihat Pratinjau Bukti"
                                >
                                  {isPdf ? (
                                    <>
                                      <FileText className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                                      <span>PDF</span>
                                    </>
                                  ) : (
                                    <>
                                      <ImageIcon className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                                      <span>Foto</span>
                                    </>
                                  )}
                                  <Eye className="h-3 w-3 text-slate-400" />
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 dark:text-slate-600 italic">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                          Anda belum pernah mencatat transaksi dalam sistem ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENGATURAN AKUN & KATA SANDI */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Informas Profil */}
              <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm">
                <UpdateProfileInformationForm
                  mustVerifyEmail={mustVerifyEmail}
                  status={status}
                />
              </div>

              {/* Form Ubah Password */}
              <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 shadow-sm">
                <UpdatePasswordForm />
              </div>
            </div>

            {/* Hapus Akun (Danger Zone) */}
            <div className="bg-white border border-rose-200 dark:bg-[#0B101B] dark:border-rose-900/30 rounded-2xl p-6 shadow-sm">
              <DeleteUserForm />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRATINJAU BUKTI TRANSAKSI MODAL (PROFILE) */}
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
