import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Edit2, Trash2, Search, X, Loader2, CheckCircle2, AlertCircle, Shield, UserCheck, ShieldCheck } from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Success Pop Up Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');

  const { data, setData, post, put, delete: destroyAction, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'staff',
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
    const name = data.name;
    const email = data.email;
    post('/dashboard/users', {
      onSuccess: () => {
        setShowAddModal(false);
        setSuccessModalTitle('Berhasil Menambahkan Pengguna');
        setSuccessModalMessage(`Akun pengguna baru "${name}" (${email}) telah sukses terdaftar dalam sistem PosFinance.`);
        setShowSuccessModal(true);
        reset();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const name = data.name;
    put(`/dashboard/users/${selectedUser.id}`, {
      onSuccess: () => {
        setShowEditModal(false);
        setSuccessModalTitle('Berhasil Perbarui Pengguna');
        setSuccessModalMessage(`Data akun pengguna "${name}" telah sukses diperbarui.`);
        setShowSuccessModal(true);
        setSelectedUser(null);
        reset();
      }
    });
  };

  const handleDeleteRequest = (userItem: UserItem) => {
    if (currentUser.id === userItem.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    setUserToDelete(userItem);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (!userToDelete) return;
    const targetUser = userToDelete;
    destroyAction(`/dashboard/users/${targetUser.id}`, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
        setSuccessModalTitle('Berhasil Menghapus Pengguna');
        setSuccessModalMessage(`Akun pengguna "${targetUser.name}" (${targetUser.email}) telah sukses dihapus secara permanen.`);
        setShowSuccessModal(true);
      }
    });
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

  const roleLabelMap: Record<string, string> = {
    admin: 'Admin Utama',
    staff: 'Staff Keuangan',
  };

  return (
    <DashboardLayout>
      <Head title="Manajemen Pengguna Logistik & Kurir - PosFinance Regional IV" />

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

        {/* Header & Add User Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-orange-500" />
              <span>Manajemen Hak Akses Pengguna Logistik & Kurir</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Kelola akun pengguna, peran, dan otorisasi hak akses sistem PosFinance.</p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-900/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5] shrink-0" />
            <span>Tambah User Baru</span>
          </button>
        </div>

        {/* User Search & Stats Card */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl p-4 transition-colors">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Alamat Email</th>
                  <th className="py-3.5 px-4">Role Akses</th>
                  <th className="py-3.5 pr-6 pl-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {u.name}
                            {currentUser.id === u.id && (
                              <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                                Saya
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {roleLabelMap[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700/50 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(u)}
                          disabled={currentUser.id === u.id}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
        {showAddModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  Tambah Pengguna Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  {Object.values(errors)[0]}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="budi@posindonesia.co.id"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value.toLowerCase())}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Kata Sandi"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Hak Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value as any)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="staff">Staff Keuangan (Pencatatan & Jurnal Transaksi)</option>
                    <option value="admin">Admin Utama (Kelola Pengguna & Sistem)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2.5 rounded-xl text-white bg-orange-600 hover:bg-orange-500 text-xs font-semibold transition-all shadow-md shadow-orange-950/50 disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan User'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-orange-500" />
                  Edit Pengguna: {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  {Object.values(errors)[0]}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="budi@posindonesia.co.id"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value.toLowerCase())}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Kata Sandi <span className="text-[10px] text-slate-500 lowercase font-normal">(kosongkan jika tidak diubah)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan Kata Sandi Baru"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Hak Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value as any)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="staff">Staff Keuangan (Pencatatan & Jurnal Transaksi)</option>
                    <option value="admin">Admin Utama (Kelola Pengguna & Sistem)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
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
          </div>,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md z-10 relative overflow-hidden shadow-2xl space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/5 shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Hapus Pengguna Ini?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    Apakah Anda yakin ingin menghapus akun ini secara permanen? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Target User Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                  {userToDelete.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{userToDelete.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userToDelete.email}</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  {roleLabelMap[userToDelete.role] || userToDelete.role}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={executeDelete}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Ya, Hapus Pengguna</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* MODAL SUCCESS NOTIFIKASI POP-UP */}
        {showSuccessModal && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative overflow-hidden animate-zoomIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-950/25">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {successModalTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {successModalMessage}
                </p>
              </div>

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
