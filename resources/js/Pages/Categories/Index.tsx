import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Edit2, Trash2, Tag, Search, X, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  nama_kategori: string;
}

interface PageProps {
  categories: Category[];
  auth: {
    user: {
      role: 'admin' | 'staff' | 'supervisor';
    };
  };
}

export default function Index() {
  const { categories, auth } = usePage<any>().props as unknown as PageProps;
  const canManage = auth?.user?.role === 'admin' || auth?.user?.role === 'supervisor';

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data, setData, post, put, delete: destroyAction, processing, errors, reset } = useForm({
    nama_kategori: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/categories', {
      onSuccess: () => {
        setShowAddModal(false);
        reset();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    put(`/dashboard/categories/${selectedCategory.id}`, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedCategory(null);
        reset();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua transaksi dalam kategori ini juga akan terhapus.')) return;
    destroyAction(`/dashboard/categories/${id}`);
  };

  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setData('nama_kategori', cat.nama_kategori);
    setShowEditModal(true);
  };

  const filteredCategories = categories.filter(c =>
    c.nama_kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head title="Kategori Transaksi - PosFinance" />

      <div className="space-y-6 animate-fadeIn">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Kategori Transaksi</h2>
            <p className="text-slate-400 text-sm">Kelola kategori pengelompokan pemasukan dan pengeluaran keuangan.</p>
          </div>

          {canManage && (
            <button
              onClick={() => { setShowAddModal(true); reset(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-600/25 transition-all duration-150 active:scale-95"
            >
              <Plus className="h-4.5 w-4.5" />
              Tambah Kategori
            </button>
          )}
        </div>

        {/* Actions (Search) */}
        <div className="flex items-center w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
          <Search className="h-4 w-4 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none w-full"
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900/50 backdrop-blur border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/50 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{cat.nama_kategori}</h4>
                  <span className="text-[10px] text-slate-500">ID: #{cat.id}</span>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              Tidak ada kategori transaksi yang ditemukan.
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden animate-zoomIn">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-white mb-4">Tambah Kategori Transaksi</h3>

              {errors.nama_kategori && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {errors.nama_kategori}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Logistik"
                    value={data.nama_kategori}
                    onChange={(e) => setData('nama_kategori', e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-semibold transition-all shadow-md shadow-orange-500/15 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden animate-zoomIn">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-white mb-4">Ubah Kategori Transaksi</h3>

              {errors.nama_kategori && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {errors.nama_kategori}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Logistik"
                    value={data.nama_kategori}
                    onChange={(e) => setData('nama_kategori', e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-xs font-semibold transition-all shadow-md shadow-orange-500/15 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
