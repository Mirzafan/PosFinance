import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Edit2, Trash2, Tag, Search, X, Loader2, CheckCircle2 } from 'lucide-react';

interface Category {
  id: number;
  nama_kategori: string;
}

interface PageProps {
  categories: Category[];
  auth: {
    user: {
      role: 'admin' | 'staff';
    };
  };
}

export default function Index() {
  const { categories, auth } = usePage<any>().props as unknown as PageProps;
  const canManage = auth?.user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Success Pop Up Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('Berhasil Menambahkan Kategori');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const { data, setData, post, put, delete: destroyAction, processing, errors, reset } = useForm({
    nama_kategori: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = data.nama_kategori;
    post('/dashboard/categories', {
      onSuccess: () => {
        setShowAddModal(false);
        setSuccessModalTitle('Berhasil Menambahkan Kategori');
        setSuccessModalMessage(`Kategori transaksi "${categoryName}" telah sukses disimpan dan ditambahkan ke dalam sistem PosFinance.`);
        setShowSuccessModal(true);
        reset();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    const categoryName = data.nama_kategori;
    put(`/dashboard/categories/${selectedCategory.id}`, {
      onSuccess: () => {
        setShowEditModal(false);
        setSuccessModalTitle('Berhasil Perbarui Kategori');
        setSuccessModalMessage(`Kategori transaksi "${categoryName}" telah sukses diperbarui.`);
        setShowSuccessModal(true);
        setSelectedCategory(null);
        reset();
      }
    });
  };

  const handleDelete = (cat: Category) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.nama_kategori}"? Semua transaksi dalam kategori ini juga akan terhapus.`)) return;
    destroyAction(`/dashboard/categories/${cat.id}`, {
      onSuccess: () => {
        setSuccessModalTitle('Berhasil Menghapus Kategori');
        setSuccessModalMessage(`Kategori transaksi "${cat.nama_kategori}" telah sukses dihapus.`);
        setShowSuccessModal(true);
      }
    });
  };

  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setData('nama_kategori', cat.nama_kategori);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    reset();
    setShowAddModal(true);
  };

  const filteredCategories = categories.filter((c) =>
    c.nama_kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head title="Kategori Transaksi - PosFinance Regional IV Semarang" />

      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="h-6 w-6 text-orange-500" />
              Kategori Transaksi
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Daftar kategori layanan (POSSAMEDAY, POSNEXTDAY, & POSREGULER) PosFinance.
            </p>
          </div>

          {canManage && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-semibold shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Tambah Kategori Baru
            </button>
          )}
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-4 transition-colors">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-orange-500/40 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  {cat.nama_kategori.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {cat.nama_kategori}
                  </h3>
                  <span className="text-[11px] text-slate-400">PosFinance Category</span>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors cursor-pointer"
                    title="Ubah Nama Kategori"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50 stroke-1" />
              <p className="text-sm font-medium">Tidak ada kategori ditemukan</p>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddModal(false)} />
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden animate-zoomIn shadow-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tambah Kategori Transaksi</h3>

              {errors.nama_kategori && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {errors.nama_kategori}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: POSSAMEDAY"
                    value={data.nama_kategori}
                    onChange={(e) => setData('nama_kategori', e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-semibold transition-all shadow-md shadow-orange-500/15 disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Modal */}
        {showEditModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden animate-zoomIn shadow-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ubah Kategori Transaksi</h3>

              {errors.nama_kategori && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  {errors.nama_kategori}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: POSSAMEDAY"
                    value={data.nama_kategori}
                    onChange={(e) => setData('nama_kategori', e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-semibold transition-all shadow-md shadow-orange-500/15 disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Pop Up Modal Success Kategori */}
        {showSuccessModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5 animate-zoomIn">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-950/25">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Header / Content Text */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {successModalTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {successModalMessage}
                </p>
              </div>

              {/* Submit Confirmation Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-950/25 transition-all cursor-pointer"
                >
                  Mengerti & Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </DashboardLayout>
  );
}
