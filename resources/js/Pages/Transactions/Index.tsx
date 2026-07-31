import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Coins,
  Plus,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  UploadCloud,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  ShieldCheck,
  AlertCircle,
  CheckSquare
} from 'lucide-react';

interface Transaction {
  id: number;
  nomor_transaksi: string;
  tanggal: string;
  jenis_transaksi: 'pemasukan' | 'pengeluaran';
  kategori_id: number;
  nominal: number;
  keterangan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  bukti_transaksi: string | null;
  bukti_transaksi_url: string | null;
  category?: { nama_kategori: string };
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
      email: string;
      role: 'admin' | 'supervisor' | 'staff';
    };
  };
  transactions: {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
  };
  categories: Category[];
  filters: {
    search?: string;
    start_date?: string;
    end_date?: string;
    kategori_id?: string;
    jenis_transaksi?: string;
    status?: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index() {
  const { auth, transactions, categories, filters, flash } = usePage<any>().props as unknown as PageProps;
  const userRole = auth.user.role;
  const isStaff = userRole === 'staff';
  const canApprove = ['admin', 'supervisor'].includes(userRole);

  // Filter States
  const [search, setSearch] = useState(filters.search || '');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');
  const [selectedType, setSelectedType] = useState(filters.jenis_transaksi || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [filePreview, setFilePreview] = useState<{ url: string; isPdf: boolean; name: string } | null>(null);

  // Bukti Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{ url: string; isPdf: boolean; nomor: string } | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trxToDelete, setTrxToDelete] = useState<Transaction | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transactions.data.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = transactions.data.length > 0 && selectedIds.length === transactions.data.length;

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menyetujui ${selectedIds.length} transaksi terpilih?`)) {
      router.post('/dashboard/transactions/bulk-approve', { ids: selectedIds }, {
        onSuccess: () => setSelectedIds([])
      });
    }
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menolak ${selectedIds.length} transaksi terpilih?`)) {
      router.post('/dashboard/transactions/bulk-reject', { ids: selectedIds }, {
        onSuccess: () => setSelectedIds([])
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih secara permanen?`)) {
      router.post('/dashboard/transactions/bulk-delete', { ids: selectedIds }, {
        onSuccess: () => setSelectedIds([])
      });
    }
  };

  // Inertia Form
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    tanggal: new Date().toISOString().split('T')[0],
    jenis_transaksi: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    kategori_id: categories.length > 0 ? String(categories[0].id) : '',
    nominal: '',
    keterangan: '',
    bukti_transaksi: null as File | null,
  });

  const applyFilters = (pageNumber = 1) => {
    const params: any = { page: pageNumber };
    if (search) params.search = search;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (selectedCategory) params.kategori_id = selectedCategory;
    if (selectedType) params.jenis_transaksi = selectedType;
    if (selectedStatus) params.status = selectedStatus;

    router.get('/dashboard/transactions', params, {
      preserveState: true,
      replace: true
    });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters(1);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedStatus('');
    router.get('/dashboard/transactions', {}, { replace: true });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Open Modal Create
  const openCreateModal = () => {
    setEditingTrx(null);
    clearErrors();
    setData({
      tanggal: new Date().toISOString().split('T')[0],
      jenis_transaksi: 'pemasukan',
      kategori_id: categories.length > 0 ? String(categories[0].id) : '',
      nominal: '',
      keterangan: '',
      bukti_transaksi: null,
    });
    setFilePreview(null);
    setIsModalOpen(true);
  };

  // Open Modal Edit (Admin/Supervisor Only)
  const openEditModal = (trx: Transaction) => {
    if (isStaff) return;
    setEditingTrx(trx);
    clearErrors();
    setData({
      tanggal: trx.tanggal ? trx.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
      jenis_transaksi: trx.jenis_transaksi,
      kategori_id: String(trx.kategori_id),
      nominal: String(trx.nominal),
      keterangan: trx.keterangan || '',
      bukti_transaksi: null,
    });

    if (trx.bukti_transaksi_url) {
      const isPdf = trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf');
      setFilePreview({
        url: trx.bukti_transaksi_url,
        isPdf,
        name: trx.bukti_transaksi ? trx.bukti_transaksi.split('/').pop() || 'Bukti Transaksi' : 'Bukti Transaksi'
      });
    } else {
      setFilePreview(null);
    }

    setIsModalOpen(true);
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('bukti_transaksi', file);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setFilePreview({
        url: URL.createObjectURL(file),
        isPdf,
        name: file.name
      });
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTrx) {
      router.post(`/dashboard/transactions/${editingTrx.id}`, {
        _method: 'PUT',
        tanggal: data.tanggal,
        jenis_transaksi: data.jenis_transaksi,
        kategori_id: data.kategori_id,
        nominal: data.nominal,
        keterangan: data.keterangan,
        bukti_transaksi: data.bukti_transaksi,
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    } else {
      post('/dashboard/transactions', {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
        }
      });
    }
  };

  // Approve & Reject Actions
  const handleApprove = (trx: Transaction) => {
    router.post(`/dashboard/transactions/${trx.id}/approve`, {}, {
      preserveScroll: true
    });
  };

  const handleReject = (trx: Transaction) => {
    router.post(`/dashboard/transactions/${trx.id}/reject`, {}, {
      preserveScroll: true
    });
  };

  // Open Proof Preview Modal
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

  // Confirm Delete (Admin/Supervisor Only)
  const handleDeleteConfirm = (trx: Transaction) => {
    if (isStaff) return;
    setTrxToDelete(trx);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!trxToDelete) return;
    router.delete(`/dashboard/transactions/${trxToDelete.id}`, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setTrxToDelete(null);
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Transaksi - PosFinance Regional IV Semarang" />

      <div className="space-y-6 animate-fadeIn">
        {/* Flash Message */}
        {flash?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm shadow-md">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
              Jurnal & Daftar Transaksi
              {isStaff && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Staff Mode (Perlu Persetujuan)
                </span>
              )}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Daftar pencatatan pemasukan dan pengeluaran kas PT Pos Indonesia Kantor Regional IV Semarang.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Catat Transaksi Baru
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 dark:bg-orange-950/80 dark:border-orange-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-slate-900 dark:text-orange-200 shadow-xl backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-2 font-semibold text-xs text-orange-700 dark:text-orange-200">
              <CheckSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span>{selectedIds.length} transaksi dipilih</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {canApprove && (
                <>
                  <button
                    onClick={handleBulkApprove}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Setujui Terpilih
                  </button>
                  <button
                    onClick={handleBulkReject}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Tolak Terpilih
                  </button>
                </>
              )}
              {!isStaff && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Terpilih
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Quick Search */}
            <div className="flex items-center w-full max-w-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 focus-within:border-orange-500/60 transition-colors">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Cari No. Transaksi atau keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="bg-transparent text-sm text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => applyFilters(1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Cari
              </button>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/50">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Mulai Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jenis Arus Kas</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">Semua</option>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status Persetujuan</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="approved">Disetujui</option>
                <option value="pending">Pending Persetujuan</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  <th className="py-3 pl-4 pr-2 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-900 cursor-pointer"
                      title="Pilih Semua"
                    />
                  </th>
                  <th className="py-3 px-2 whitespace-nowrap">No. Transaksi</th>
                  <th className="py-3 px-2 whitespace-nowrap">Tanggal</th>
                  <th className="py-3 px-2 whitespace-nowrap">Jenis</th>
                  <th className="py-3 px-2 whitespace-nowrap">Kategori</th>
                  <th className="py-3 px-2 whitespace-nowrap">Status</th>
                  <th className="py-3 px-2 min-w-[120px]">Keterangan</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Nominal</th>
                  <th className="py-3 px-2 text-center whitespace-nowrap">Bukti</th>
                  {!isStaff && <th className="py-3 pr-4 pl-2 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {transactions.data.map((trx) => {
                  const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;
                  const isSelected = selectedIds.includes(trx.id);

                  return (
                    <tr 
                      key={trx.id} 
                      className={`
                        text-slate-700 dark:text-slate-300 transition-colors group
                        ${isSelected ? 'bg-orange-500/10 dark:bg-orange-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                      `}
                    >
                      <td className="py-3 pl-4 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(trx.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.nomor_transaksi}
                      </td>
                      <td className="py-3 px-2 text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {new Date(trx.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-2 text-xs whitespace-nowrap">
                        {trx.jenis_transaksi === 'pemasukan' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                            Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <ArrowDownLeft className="h-3 w-3 text-rose-400" />
                            Pengeluaran
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded-full border dark:border-slate-700/50">
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse" title="Pending Persetujuan">
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

                      <td className="py-3 px-2 text-xs max-w-[150px] truncate">
                        {trx.keterangan || '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-bold whitespace-nowrap">
                        {trx.jenis_transaksi === 'pemasukan' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs inline-flex items-center justify-end font-semibold">
                            {formatRupiah(trx.nominal)}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 text-xs inline-flex items-center justify-end font-semibold">
                            {formatRupiah(trx.nominal)}
                          </span>
                        )}
                      </td>

                      {/* Bukti Column */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
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
                          <span className="text-[11px] text-slate-400 dark:text-slate-600 italic">Tidak Ada</span>
                        )}
                      </td>

                      {/* Actions Column (Admin & Supervisor Only) */}
                      {!isStaff && (
                        <td className="py-3 pr-4 pl-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* Approve & Reject Buttons (Admin & Supervisor Only for Pending Items) */}
                            {canApprove && trx.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(trx)}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white border border-emerald-500/30 text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                                  title="Setujui Transaksi (Approve)"
                                >
                                  <Check className="h-3 w-3" />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleReject(trx)}
                                  className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white border border-rose-500/30 text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer"
                                  title="Tolak Transaksi (Reject)"
                                >
                                  <X className="h-3 w-3" />
                                  Tolak
                                </button>
                              </>
                            )}

                            {/* Edit & Delete Buttons */}
                            <button
                              onClick={() => openEditModal(trx)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer"
                              title="Edit Transaksi"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(trx)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {transactions.data.length === 0 && (
                  <tr>
                    <td colSpan={isStaff ? 8 : 9} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
                          <Coins className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum Ada Transaksi Tercatat</h4>
                          <p className="text-xs text-slate-500 mt-1">Klik tombol <strong>"Catat Transaksi Baru"</strong> di atas untuk menambah transaksi pertamamu.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {transactions.last_page > 1 && (
            <div className="border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/10">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="text-slate-900 dark:text-slate-300 font-semibold">{transactions.data.length}</span> dari{' '}
                <span className="text-slate-900 dark:text-slate-300 font-semibold">{transactions.total}</span> transaksi
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={transactions.current_page === 1}
                  onClick={() => applyFilters(transactions.current_page - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Sebelumnya
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2.5">
                  Halaman <span className="text-slate-900 dark:text-slate-200 font-bold">{transactions.current_page}</span> dari {transactions.last_page}
                </span>
                <button
                  disabled={transactions.current_page === transactions.last_page}
                  onClick={() => applyFilters(transactions.current_page + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Berikutnya
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM CATAT / EDIT TRANSAKSI */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-orange-500" />
                {editingTrx ? 'Edit Record Transaksi' : 'Catat Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm">
              {/* Notice for Staff */}
              {isStaff && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Transaksi yang diinput oleh Staff akan memerlukan persetujuan (approval) dari Admin atau Supervisor sebelum masuk ke laporan saldo resmi.</span>
                </div>
              )}

              {/* Jenis Arus Kas */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Jenis Arus Kas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`py-3 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      data.jenis_transaksi === 'pemasukan'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md shadow-emerald-950/25 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenis_transaksi"
                      value="pemasukan"
                      checked={data.jenis_transaksi === 'pemasukan'}
                      onChange={() => setData('jenis_transaksi', 'pemasukan')}
                      className="sr-only"
                    />
                    <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Pemasukan Kas
                  </label>

                  <label
                    className={`py-3 px-4 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      data.jenis_transaksi === 'pengeluaran'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-md shadow-rose-950/25 ring-1 ring-rose-500'
                        : 'bg-slate-50 border-slate-300 dark:bg-slate-950 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenis_transaksi"
                      value="pengeluaran"
                      checked={data.jenis_transaksi === 'pengeluaran'}
                      onChange={() => setData('jenis_transaksi', 'pengeluaran')}
                      className="sr-only"
                    />
                    <ArrowDownLeft className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Pengeluaran Kas
                  </label>
                </div>
                {errors.jenis_transaksi && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.jenis_transaksi}</p>
                )}
              </div>

              {/* Tanggal & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data.tanggal}
                    onChange={(e) => setData('tanggal', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500"
                    required
                  />
                  {errors.tanggal && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.tanggal}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.kategori_id}
                    onChange={(e) => setData('kategori_id', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                    ))}
                  </select>
                  {errors.kategori_id && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.kategori_id}</p>}
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nominal (IDR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    value={data.nominal}
                    onChange={(e) => setData('nominal', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                {errors.nominal && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.nominal}</p>}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Keterangan / Catatan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Pembayaran tagihan pengiriman PosPay cabang..."
                  value={data.keterangan}
                  onChange={(e) => setData('keterangan', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-orange-500"
                />
                {errors.keterangan && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.keterangan}</p>}
              </div>

              {/* Upload Bukti Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Bukti Transaksi (Foto / PDF) {!editingTrx && <span className="text-rose-500">*</span>}
                </label>

                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-800 border-dashed rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                  <div className="space-y-2 text-center">
                    {filePreview ? (
                      <div className="flex flex-col items-center gap-2">
                        {filePreview.isPdf ? (
                          <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                            <FileText className="h-8 w-8" />
                          </div>
                        ) : (
                          <div className="relative group">
                            <img
                              src={filePreview.url}
                              alt="Preview Bukti"
                              className="w-24 h-24 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-md"
                            />
                          </div>
                        )}
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{filePreview.name}</span>
                        <label className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold cursor-pointer">
                          Ganti File
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                        <div className="flex text-xs text-slate-500 dark:text-slate-400">
                          <label className="relative cursor-pointer font-semibold text-orange-600 dark:text-orange-400 hover:underline focus-within:outline-none">
                            <span>Pilih file foto atau PDF</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={handleFileChange}
                              required={!editingTrx}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-600">
                          PNG, JPG, WEBP, atau PDF hingga 10 MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.bukti_transaksi && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.bukti_transaksi}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-950/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {processing ? 'Menyimpan...' : editingTrx ? 'Simpan Perubahan' : 'Catat Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRATINJAU BUKTI TRANSAKSI (FOTO / PDF VIEWER) */}
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

      {/* ========================================================================= */}
      {/* MODAL 3: KONFIRMASI HAPUS TRANSAKSI (ADMIN & SUPERVISOR ONLY) */}
      {/* ========================================================================= */}
      {deleteModalOpen && trxToDelete && !isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Hapus Record Transaksi?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nomor: <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{trxToDelete.nomor_transaksi}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data transaksi beserta file bukti transaksi terkait akan dihapus secara permanen dari server.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-950/25 transition-all cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
