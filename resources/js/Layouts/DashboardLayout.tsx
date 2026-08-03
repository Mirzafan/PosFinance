import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, router, usePage } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  Tag, 
  Coins, 
  FileBarChart2, 
  Users, 
  LogOut,
  Calendar,
  User as UserIcon,
  Menu,
  X,
  ChevronLeft,
  PanelLeft,
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../Hooks/useTheme';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'supervisor';
}

interface NotificationItem {
  id: string;
  trx_id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  link: string;
  category: 'warning' | 'success' | 'danger' | 'info';
}

interface PageProps {
  auth: {
    user: User;
  };
  notifications?: NotificationItem[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const props = usePage<any>().props as unknown as PageProps;
  const user = props.auth.user;
  const notifications: NotificationItem[] = props.notifications || [];
  const { theme, toggleTheme } = useTheme();

  const [currentDate, setCurrentDate] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Notification State
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('posfinance_read_notifications');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;

  const handleNotificationClick = (item: NotificationItem) => {
    if (!readNotifIds.includes(item.id)) {
      const updated = [...readNotifIds, item.id];
      setReadNotifIds(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('posfinance_read_notifications', JSON.stringify(updated));
      }
    }
    setNotifOpen(false);
    router.visit(item.link);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('posfinance_read_notifications', JSON.stringify(updated));
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('posfinance_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    const formatted = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formatted);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const nextState = !prev;
      localStorage.setItem('posfinance_sidebar_open', String(nextState));
      return nextState;
    });
  };

  if (!user) return null;

  const pathname = window.location.pathname;

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'staff', 'supervisor'],
    },
    {
      label: 'Kategori Transaksi',
      href: '/dashboard/categories',
      icon: Tag,
      roles: ['admin', 'staff', 'supervisor'],
    },
    {
      label: 'Transaksi',
      href: '/dashboard/transactions',
      icon: Coins,
      roles: ['admin', 'staff', 'supervisor'],
    },
    {
      label: 'Laporan Keuangan',
      href: '/dashboard/reports',
      icon: FileBarChart2,
      roles: ['admin', 'staff', 'supervisor'],
    },
    {
      label: 'User Management',
      href: '/dashboard/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Audit Log',
      href: '/dashboard/audit-logs',
      icon: ShieldCheck,
      roles: ['admin', 'supervisor'],
    },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-200">
      {/* Sidebar - Fixed 100vh Full Slide Hide/Show for Desktop & Mobile */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 
          flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden no-scrollbar
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-x-hidden">
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Intact Logo Badge */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/20 shrink-0 text-[10px] font-black text-white select-none">
                POS
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none truncate">PosFinance</h2>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block truncate">Regional IV Semarang</span>
              </div>
            </div>

            {/* Desktop Close/Hide Button */}
            <button
              onClick={toggleSidebar}
              title="Sembunyikan Sidebar"
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto overflow-x-hidden flex-1 no-scrollbar">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/dashboard'
                ? (pathname === '/dashboard' || pathname === '/dashboard/')
                : (pathname === item.href || pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session Info & Logout - Fixed at Bottom of Sidebar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 overflow-x-hidden no-scrollbar">
          <Link
            href="/profile"
            className="bg-slate-100 border border-slate-200 dark:bg-slate-950/50 dark:border-slate-800/80 hover:border-orange-500/40 hover:bg-slate-200 dark:hover:bg-slate-950 rounded-xl p-3 mb-2.5 flex items-center gap-3 transition-all group cursor-pointer"
            title="Buka Profil Saya"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-md group-hover:scale-105 transition-transform">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate leading-tight transition-colors">{user.name}</h4>
              <span className="inline-block text-[9px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-full mt-1">
                {user.role}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Dynamic Padding */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:pl-64' : 'md:pl-0'
      }`}>
        {/* Top Navbar Header (Sticky) */}
        <header className="h-16 border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            {/* Toggle Button for Mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Open Button (Only visible when sidebar is hidden on desktop) */}
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                title="Tampilkan Sidebar"
                className="hidden md:flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold text-xs bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                  <PanelLeft className="h-4.5 w-4.5" />
                  <span>Buka Menu</span>
                </div>
              </button>
            )}

            <div>
              <h1 className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Selamat datang kembali, <Link href="/profile" className="text-slate-900 dark:text-white font-bold hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition-colors">{user.name}</Link>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                PT Pos Indonesia - Kantor Regional IV Semarang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Notification Center Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                title="Pusat Notifikasi"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center relative cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-zoomIn">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Pusat Notifikasi
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            {unreadCount} baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Tandai Dibaca
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                          <Bell className="h-8 w-8 mx-auto stroke-1 opacity-50" />
                          <p className="text-xs font-medium">Belum ada notifikasi baru</p>
                        </div>
                      ) : (
                        notifications.map((item) => {
                          const isRead = readNotifIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNotificationClick(item)}
                              className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                                isRead
                                  ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                                  : 'bg-orange-500/[0.04] dark:bg-orange-500/[0.06] hover:bg-orange-500/[0.08] font-medium'
                              }`}
                            >
                              {/* Category Icon */}
                              <div className="mt-0.5 shrink-0">
                                {item.category === 'warning' && (
                                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <Clock className="h-4 w-4" />
                                  </div>
                                )}
                                {item.category === 'success' && (
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                )}
                                {item.category === 'danger' && (
                                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                    <XCircle className="h-4 w-4" />
                                  </div>
                                )}
                                {item.category === 'info' && (
                                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Coins className="h-4 w-4" />
                                  </div>
                                )}
                              </div>

                              {/* Notification Content */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    {item.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                    {item.time}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                                  {item.message}
                                </p>
                              </div>

                              {/* Unread Dot */}
                              {!isRead && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 self-center" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-center">
                      <Link
                        href="/dashboard/transactions"
                        onClick={() => setNotifOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                      >
                        <span>Lihat Seluruh Jurnal Transaksi</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-800/80 px-3.5 py-1.5 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
              <span>{currentDate}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all group cursor-pointer"
              title="Buka Profil Saya"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-none">{user.name}</p>
                <span className="text-[10px] text-slate-500 font-medium lowercase">
                  {user.email}
                </span>
              </div>
              <div className="h-9 w-9 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-600 dark:text-orange-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center font-bold uppercase shadow-sm transition-all">
                <UserIcon className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden animate-fadeIn"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5 animate-zoomIn">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logout Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-950/25">
              <LogOut className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Konfirmasi Keluar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun PosFinance? Anda perlu melakukan login kembali untuk mengakses sistem.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => router.post('/logout')}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-950/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
