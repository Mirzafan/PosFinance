import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
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
  PanelLeftClose,
  PanelLeft,
  ShieldCheck
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'supervisor';
}

interface PageProps {
  auth: {
    user: User;
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { auth } = usePage<any>().props as unknown as PageProps;
  const user = auth.user;

  const [currentDate, setCurrentDate] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      {/* Sidebar - Fixed 100vh Full Slide Hide/Show for Desktop & Mobile */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 
          flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden no-scrollbar
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-x-hidden">
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Intact Logo Badge */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/20 shrink-0 text-[10px] font-black text-white select-none">
                POS
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white leading-none truncate">PosFinance</h2>
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block truncate">Regional IV Semarang</span>
              </div>
            </div>

            {/* Desktop Close/Hide Button */}
            <button
              onClick={toggleSidebar}
              title="Sembunyikan Sidebar"
              className="hidden md:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
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
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session Info & Logout - Fixed at Bottom of Sidebar */}
        <div className="p-3.5 border-t border-slate-800 shrink-0 bg-slate-900 overflow-x-hidden no-scrollbar">
          <Link
            href="/profile"
            className="bg-slate-950/50 border border-slate-800/80 hover:border-orange-500/40 hover:bg-slate-950 rounded-xl p-3 mb-2.5 flex items-center gap-3 transition-all group cursor-pointer"
            title="Buka Profil Saya"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-md group-hover:scale-105 transition-transform">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white group-hover:text-orange-400 truncate leading-tight transition-colors">{user.name}</h4>
              <span className="inline-block text-[9px] font-bold text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-full mt-1">
                {user.role}
              </span>
            </div>
          </Link>

          <Link
            method="post"
            href="/logout"
            as="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area with Dynamic Padding */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:pl-64' : 'md:pl-0'
      }`}>
        {/* Top Navbar Header (Sticky) */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Toggle Button for Mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Open Button (Only visible when sidebar is hidden on desktop) */}
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                title="Tampilkan Sidebar"
                className="hidden md:flex items-center gap-2 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                  <PanelLeft className="h-4.5 w-4.5" />
                  <span>Buka Menu</span>
                </div>
              </button>
            )}

            <div>
              <h1 className="text-xs md:text-sm font-semibold text-slate-300">
                Selamat datang kembali, <Link href="/profile" className="text-white font-bold hover:text-orange-400 hover:underline transition-colors">{user.name}</Link>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                PT Pos Indonesia - Kantor Regional IV Semarang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 border border-slate-800/80 px-3.5 py-1.5 rounded-full">
              <Calendar className="h-3.5 w-3.5 text-orange-500" />
              <span>{currentDate}</span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-all group cursor-pointer"
              title="Buka Profil Saya"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors leading-none">{user.name}</p>
                <span className="text-[10px] text-slate-500 font-medium lowercase">
                  {user.email}
                </span>
              </div>
              <div className="h-9 w-9 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-500 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center font-bold uppercase shadow-sm transition-all">
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
    </div>
  );
}
