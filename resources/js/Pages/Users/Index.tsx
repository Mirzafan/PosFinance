import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Edit2, Trash2, Search, X, Loader2, CheckCircle2, AlertCircle, Shield, UserCheck, ShieldCheck } from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'supervisor';
}

interface PageProps {
  users: UserItem[];
  auth: {
    user: UserItem;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function Index() {
  const { users, auth, flash } = usePage<any>().props as unknown as PageProps;
  const currentUser = auth.user;

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const { data, setData, post, put, delete: destroyAction, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'staff' | 'supervisor',
  });

  const openAddModal = () => {
    clearErrors();
    reset();
    setData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/users', {
      onSuccess: () => {
        setShowAddModal(false);
        reset();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    put(`/dashboard/users/${selectedUser.id}`, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedUser(null);
        reset();
      }
    });
  };

  const handleDelete = (userItem: UserItem) => {
    if (currentUser.id === userItem.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus akun user: ${userItem.name}?`)) return;
    destroyAction(`/dashboard/users/${userItem.id}`);
  };

  const openEditModal = (userItem: UserItem) => {
    clearErrors();
    setSelectedUser(userItem);
    setData({
      name: userItem.name,
      email: userItem.email,
      password: '',
      role: userItem.role,
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabelMap = {
    admin: 'Admin Utama',
    supervisor: 'Supervisor Keuangan',
    staff: 'Staff Keuangan',
  };

  return (
    <DashboardLayout>
      <Head title="Manajemen Pengguna - PosFinance" />

      <div className="space-y-6 animate-fadeIn">
        {/* Flash Notifications */}
        {flash?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm shadow-md">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}

        {flash?.error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-sm shadow-md">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{flash.error}</span>
          </div>
        )}

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              Manajemen Pengguna
              <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                {users.length} Akun Terdaftar
              </span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Kelola otorisasi akun pengguna beserta hak akses peran (Role) mereka.</p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-600/25 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Tambah Pengguna
          </button>
        </div>

        {/* Actions (Search) */}
        <div className="flex items-center w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
          <Search className="h-4 w-4 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Cari nama atau email pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 focus:outline-none w-full"
          />
        </div>

        {/* Table view */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-950/40">
                  <th className="py-3.5 pl-6 pr-4 whitespace-nowrap">Nama Pengguna</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Alamat Email</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Hak Akses Role</th>
                  <th className="py-3.5 pr-6 pl-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="text-slate-300 hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-md">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{u.name}</h4>
                          <span className="text-[10px] text-slate-500">User ID: #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                          : u.role === 'supervisor'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {roleLabelMap[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700/50 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={currentUser.id === u.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={currentUser.id === u.id ? 'Tidak dapat menghapus diri sendiri' : 'Hapus User'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                      Tidak ada pengguna yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  Tambah Pengguna Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {Object.values(errors)[0]}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="budi@posindonesia.co.id"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 8 Karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Hak Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value as any)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="staff">Staff Keuangan (Input Transaksi & Pending Approval)</option>
                    <option value="supervisor">Supervisor Keuangan (Approve Transaksi & Laporan)</option>
                    <option value="admin">Admin Utama (Kelola Pengguna & Metadata)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-orange-600 hover:bg-orange-500 text-xs font-semibold transition-all shadow-md shadow-orange-950/50 disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Pengguna'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-orange-500" />
                  Edit Data Pengguna
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {Object.values(errors)[0]}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="budi@posindonesia.co.id"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Kata Sandi <span className="text-[10px] text-slate-500 lowercase font-normal">(kosongkan jika tidak diubah)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan Kata Sandi Baru"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Hak Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value as any)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="staff">Staff Keuangan (Input Transaksi & Pending Approval)</option>
                    <option value="supervisor">Supervisor Keuangan (Approve Transaksi & Laporan)</option>
                    <option value="admin">Admin Utama (Kelola Pengguna & Metadata)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-orange-600 hover:bg-orange-500 text-xs font-semibold transition-all shadow-md shadow-orange-950/50 disabled:opacity-50 cursor-pointer"
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
