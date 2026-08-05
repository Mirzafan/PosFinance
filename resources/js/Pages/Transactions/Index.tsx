import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  Edit3,
  Trash2,
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Transaction {
  id: number;
  nomor_transaksi: string;
  tanggal: string;
  jenis_transaksi: 'pemasukan' | 'pengeluaran';
  kategori_id: number;
  nominal: number;
  nominal_ongkir?: number;
  nominal_asuransi?: number;
  net_revenue?: number;
  keterangan: string | null;
  status: 'pending' | 'approved' | 'rejected';
  closed_at?: string | null;
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
      role: 'admin' | 'staff';
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
  const isAdmin = userRole === 'admin';

  // Filter States
  const [search, setSearch] = useState(filters.search || '');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.kategori_id || '');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [filePreview, setFilePreview] = useState<{ url: string; isPdf: boolean; name: string } | null>(null);
  
  const [ongkirDisplay, setOngkirDisplay] = useState('');
  const [asuransiDisplay, setAsuransiDisplay] = useState('');
  const [useInsurance, setUseInsurance] = useState(false);

  // Daily Closing Modal State
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);

  // Bukti Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{ url: string; isPdf: boolean; nomor: string } | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trxToDelete, setTrxToDelete] = useState<Transaction | null>(null);

  // Success Pop Up Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('Berhasil');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const formatNumberWithDots = (val: string | number) => {
    if (!val && val !== 0) return '';
    const digits = String(val).split('.')[0].replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('id-ID').format(Number(digits));
  };

  const handleOngkirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setOngkirDisplay('');
      setAsuransiDisplay('');
      setData(prev => ({
        ...prev,
        nominal_ongkir: '',
        nominal: '',
        nominal_asuransi: '0',
      }));
    } else {
      const ongkirNum = Number(rawValue);
      const formattedOngkir = new Intl.NumberFormat('id-ID').format(ongkirNum);
      setOngkirDisplay(formattedOngkir);

      if (useInsurance) {
        const autoAsuransi = Math.round(ongkirNum * 0.02);
        const formattedAsuransi = new Intl.NumberFormat('id-ID').format(autoAsuransi);
        setAsuransiDisplay(formattedAsuransi);
        setData(prev => ({
          ...prev,
          nominal_ongkir: rawValue,
          nominal: rawValue,
          nominal_asuransi: String(autoAsuransi),
        }));
      } else {
        setData(prev => ({
          ...prev,
          nominal_ongkir: rawValue,
          nominal: rawValue,
          nominal_asuransi: '0',
        }));
      }
    }
  };

  const handleAsuransiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAsuransiDisplay('');
      setData('nominal_asuransi', '0');
    } else {
      const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
      setAsuransiDisplay(formatted);
      setData('nominal_asuransi', rawValue);
    }
  };

  // Inertia Form
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    tanggal: new Date().toISOString().split('T')[0],
    jenis_transaksi: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    kategori_id: categories.length > 0 ? String(categories[0].id) : '',
    nominal: '',
    nominal_ongkir: '',
    nominal_asuransi: '0',
    keterangan: '',
    bukti_transaksi: null as File | null,
  });

  const applyFilters = (pageNumber = 1) => {
    const params: any = { page: pageNumber };
    if (search) params.search = search;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (selectedCategory) params.kategori_id = selectedCategory;

    router.get('/dashboard/transactions', params, {
      preserveState: true,
      replace: true
    });
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
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
    setUseInsurance(false);
    setData({
      tanggal: new Date().toISOString().split('T')[0],
      jenis_transaksi: 'pemasukan',
      kategori_id: categories.length > 0 ? String(categories[0].id) : '',
      nominal: '',
      nominal_ongkir: '',
      nominal_asuransi: '0',
      keterangan: '',
      bukti_transaksi: null,
    });
    setOngkirDisplay('');
    setAsuransiDisplay('');
    setFilePreview(null);
    setIsModalOpen(true);
  };

  // Open Modal Edit
  const openEditModal = (trx: Transaction) => {
    if (isStaff) return;
    setEditingTrx(trx);
    clearErrors();
    const rawOngkir = String(trx.nominal_ongkir || trx.nominal || 0);
    const rawAsuransi = String(trx.nominal_asuransi || 0);
    const hasAsuransi = Number(rawAsuransi) > 0;

    setUseInsurance(hasAsuransi);

    setData({
      tanggal: trx.tanggal ? trx.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
      jenis_transaksi: trx.jenis_transaksi,
      kategori_id: String(trx.kategori_id),
      nominal: rawOngkir,
      nominal_ongkir: rawOngkir,
      nominal_asuransi: hasAsuransi ? rawAsuransi : '0',
      keterangan: trx.keterangan || '',
      bukti_transaksi: null,
    });
    setOngkirDisplay(formatNumberWithDots(rawOngkir));
    setAsuransiDisplay(hasAsuransi ? formatNumberWithDots(rawAsuransi) : '');

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
        nominal_ongkir: data.nominal_ongkir,
        nominal_asuransi: data.nominal_asuransi,
        keterangan: data.keterangan,
        bukti_transaksi: data.bukti_transaksi,
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setSuccessModalTitle('Berhasil Perbarui Transaksi');
          setSuccessModalMessage('Catatan transaksi telah sukses diperbarui.');
          setShowSuccessModal(true);
          reset();
        }
      });
    } else {
      post('/dashboard/transactions', {
        onSuccess: () => {
          setIsModalOpen(false);
          setSuccessModalTitle('Berhasil Menambahkan Transaksi');
          setSuccessModalMessage('Transaksi pendapatan baru berhasil dicatat dalam jurnal PosFinance.');
          setShowSuccessModal(true);
          reset();
        }
      });
    }
  };

  // Daily Closing Action
  const handleDailyClosingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/dashboard/transactions/daily-closing', { tanggal: closingDate }, {
      onSuccess: () => {
        setIsClosingModalOpen(false);
        setSuccessModalTitle('Daily Closing Berhasil');
        setSuccessModalMessage(`Proses Closing Harian & Approval untuk tanggal ${closingDate} telah sukses dilaksanakan.`);
        setShowSuccessModal(true);
      }
    });
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

  const handleDeleteConfirm = (trx: Transaction) => {
    if (isStaff) return;
    setTrxToDelete(trx);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (!trxToDelete) return;
    const nomorTrx = trxToDelete.nomor_transaksi;
    router.delete(`/dashboard/transactions/${trxToDelete.id}`, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setTrxToDelete(null);
        setSuccessModalTitle('Berhasil Menghapus Transaksi');
        setSuccessModalMessage(`Data transaksi ${nomorTrx} telah dihapus.`);
        setShowSuccessModal(true);
      }
    });
  };

  return (
    <DashboardLayout>
      <Head title="Jurnal Transaksi - PosFinance Regional IV" />

      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
              Jurnal & Daftar Transaksi Kurir
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Pencatatan pendapatan ongkir & pengeluaran asuransi paket (POSSAMEDAY, POSNEXTDAY, POSREGULER, POSKARGO, EXPRESS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-orange-900/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Catat Transaksi Paket
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center w-full max-w-sm bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Cari No. Transaksi atau keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters(1)}
                className="bg-transparent text-sm text-slate-900 dark:text-slate-300 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => applyFilters(1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Cari
              </button>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/50">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Mulai Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Jenis Produk</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-300 cursor-pointer"
              >
                <option value="">Semua Jenis Produk</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  <th className="py-3 pl-4 pr-2 whitespace-nowrap">No. Transaksi</th>
                  <th className="py-3 px-2 whitespace-nowrap">Tanggal</th>
                  <th className="py-3 px-2 whitespace-nowrap">Jenis Produk</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Ongkir (Pemasukan)</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Asuransi (Pengeluaran)</th>
                  <th className="py-3 px-2 text-right whitespace-nowrap">Net Revenue</th>
                  <th className="py-3 px-2 text-center whitespace-nowrap">Bukti</th>
                  {!isStaff && <th className="py-3 pr-4 pl-2 text-center whitespace-nowrap">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {transactions.data.map((trx) => {
                  const isPdf = trx.bukti_transaksi_url ? trx.bukti_transaksi_url.toLowerCase().endsWith('.pdf') : false;
                  const ongkir = Number((trx.nominal_ongkir && trx.nominal_ongkir > 0) ? trx.nominal_ongkir : (trx.nominal || 0));
                  const asuransi = Number(trx.nominal_asuransi || 0);
                  const net = ongkir - asuransi;

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-4 pr-2 font-mono text-[11px] font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.nomor_transaksi}
                      </td>
                      <td className="py-3 px-2 text-xs font-medium whitespace-nowrap">
                        {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/50 px-2.5 py-0.5 rounded-full">
                          {trx.category?.nama_kategori || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatRupiah(ongkir)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {asuransi > 0 ? formatRupiah(asuransi) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatRupiah(net)}
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {trx.bukti_transaksi_url ? (
                          <button
                            onClick={() => openProofPreview(trx)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 cursor-pointer"
                          >
                            {isPdf ? <FileText className="h-3 w-3 text-rose-500" /> : <ImageIcon className="h-3 w-3 text-cyan-600" />}
                            <Eye className="h-3 w-3 text-slate-400" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tidak Ada</span>
                        )}
                      </td>
                      {!isStaff && (
                        <td className="py-3 pr-4 pl-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(trx)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Edit Transaksi"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(trx)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                        <Coins className="h-8 w-8 text-slate-400" />
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum Ada Transaksi Paket</h4>
                        <p className="text-xs text-slate-500">Klik tombol "Catat Transaksi Paket" untuk menambahkan data.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {transactions.last_page > 1 && (
            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {transactions.data.length} dari {transactions.total} transaksi
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={transactions.current_page === 1}
                  onClick={() => applyFilters(transactions.current_page - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 inline" /> Sebelumnya
                </button>
                <span className="text-xs text-slate-500 px-2">
                  Halaman {transactions.current_page} dari {transactions.last_page}
                </span>
                <button
                  disabled={transactions.current_page === transactions.last_page}
                  onClick={() => applyFilters(transactions.current_page + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-35 cursor-pointer"
                >
                  Berikutnya <ChevronRight className="h-3.5 w-3.5 inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM CATAT / EDIT TRANSAKSI */}
      {/* ========================================================================= */}
      {isModalOpen && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-orange-500" />
                {editingTrx ? 'Edit Record Transaksi Paket' : 'Catat Transaksi Paket Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data.tanggal}
                    onChange={(e) => setData('tanggal', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Jenis Produk / Layanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.kategori_id}
                    onChange={(e) => setData('kategori_id', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 cursor-pointer"
                    required
                  >
                    <option value="">Pilih Jenis Produk</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nominal Ongkir */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Pendapatan Ongkir (Pemasukan) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 50.000"
                    value={ongkirDisplay}
                    onChange={handleOngkirChange}
                    className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Opsi Tambahkan Asuransi Paket */}
              <div className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={useInsurance}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseInsurance(checked);
                        if (checked) {
                          const ongkirNum = Number(data.nominal_ongkir || 0);
                          const calc2Pct = Math.round(ongkirNum * 0.02);
                          setAsuransiDisplay(calc2Pct > 0 ? formatNumberWithDots(calc2Pct) : '');
                          setData('nominal_asuransi', String(calc2Pct));
                        } else {
                          setAsuransiDisplay('');
                          setData('nominal_asuransi', '0');
                        }
                      }}
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>Tambahkan Pengeluaran Asuransi Paket (2% dari Ongkir)</span>
                  </label>
                  {useInsurance && (
                    <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-300">
                      Auto 2% Ongkir
                    </span>
                  )}
                </div>

                {useInsurance && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nominal Pengeluaran Asuransi Paket
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Contoh: 1.000"
                        value={asuransiDisplay}
                        onChange={handleAsuransiChange}
                        className="w-full bg-white border border-slate-300 dark:bg-slate-900 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Dihitung 2% dari nominal ongkir</span>
                      <button
                        type="button"
                        onClick={() => {
                          const ongkirNum = Number(data.nominal_ongkir || 0);
                          const calc2Pct = Math.round(ongkirNum * 0.02);
                          setAsuransiDisplay(formatNumberWithDots(calc2Pct));
                          setData('nominal_asuransi', String(calc2Pct));
                        }}
                        className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                      >
                        Reset 2% Auto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan transaksi paket..."
                  value={data.keterangan}
                  onChange={(e) => setData('keterangan', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Bukti Transaksi (Foto / PDF) {!editingTrx && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2"
                  required={!editingTrx}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingTrx ? 'Simpan Perubahan' : 'Simpan Transaksi Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Proof Preview Modal */}
      {previewModalOpen && activePreview && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pratinjau Bukti Transaksi #{activePreview.nomor}
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[60vh] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden">
              {activePreview.isPdf ? (
                <iframe src={activePreview.url} className="w-full h-full border-none" title="Bukti PDF" />
              ) : (
                <img src={activePreview.url} alt="Bukti Foto" className="max-h-full max-w-full object-contain" />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccessModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 text-center space-y-4 shadow-2xl">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{successModalTitle}</h3>
            <p className="text-xs text-slate-500">{successModalMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
