import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Loader2, ArrowLeft, Send, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/Hooks/useTheme';

export default function ForgotPassword({ status }: { status?: string }) {
  const { theme, toggleTheme } = useTheme();

  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('password.email'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 transition-colors duration-200">
      <Head title="Lupa Kata Sandi - PosFinance" />

      {/* Floating Theme Toggle Button */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
          className="p-2.5 rounded-2xl bg-white/80 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-amber-400 shadow-sm backdrop-blur-md transition-all cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/15 dark:bg-orange-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/15 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-lg shadow-orange-500/30 mb-4 ring-4 ring-orange-500/10">
            <span className="text-2xl font-black text-white tracking-tighter">POS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
            Reset Kata Sandi
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium max-w-sm mx-auto">
            Pos Indonesia Kantor Regional 4 Semarang
          </p>
        </div>

        {/* Forgot password card */}
        <div className="bg-white/90 border border-slate-200/80 dark:bg-slate-900/60 backdrop-blur-xl dark:border-slate-800/80 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden space-y-5 transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Lupa kata sandi akun Anda? Masukkan alamat email terdaftar di bawah ini. Kami akan mengirimkan tautan reset kata sandi ke email Anda.
          </p>

          {status && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 shadow-md font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Tautan reset kata sandi telah berhasil dikirim! Silakan periksa kotak masuk (inbox/spam) Gmail Anda.</span>
            </div>
          )}

          {errors.email && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
              {errors.email}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="example@example.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value.toLowerCase())}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 dark:bg-slate-950/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-600/25 transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Tautan Reset Password
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 text-center">
            <Link
              href={route('login')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-1 z-10">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} PT Pos Indonesia (Persero) &bull; Kantor Regional IV Semarang
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            PosFinance v1.0 &bull; Sistem Manajemen Keuangan & Pendapatan Logistik &amp; Kurir
          </p>
        </div>
      </div>
    </div>
  );
}

