import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  PhoneCall,
  Search,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Coins,
  Sparkles,
  UserCheck,
  Loader2
} from 'lucide-react';

interface DBMessage {
  id: number;
  user_id: number;
  senderRole: 'admin' | 'staff';
  senderName: string;
  text: string;
  time: string;
  created_at: string;
}

interface DiskusiProps {
  dbMessages?: DBMessage[];
}

export default function DiskusiIndex({ dbMessages = [] }: DiskusiProps) {
  const { auth } = usePage<any>().props;
  const user = auth.user;
  const isAdmin = user.role === 'admin';

  const [activeTab, setActiveTab] = useState<'chat' | 'sop' | 'contact'>('chat');
  const [isSending, setIsSending] = useState(false);

  // Auto-polling messages from database every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['dbMessages'] });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const displayMessages = dbMessages.length > 0 ? dbMessages : [
    {
      id: 1,
      user_id: 999,
      senderRole: 'staff' as const,
      senderName: 'Staff Keuangan (Budi)',
      text: 'Halo Admin Keuangan, mohon bantuan untuk info penguncian kas harian hari ini.',
      time: '08:30',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: 998,
      senderRole: 'admin' as const,
      senderName: 'Admin Keuangan',
      text: 'Halo Kak Budi, penutupan kas harian otomatis dilakukan pukul 17.00 WIB. Ada transaksi yang perlu diperiksa?',
      time: '08:32',
      created_at: new Date().toISOString()
    }
  ];

  const [newReplyText, setNewReplyText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || isSending) return;

    setIsSending(true);
    router.post(
      '/dashboard/diskusi/messages',
      { message: newReplyText },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewReplyText('');
          setIsSending(false);
        },
        onError: () => {
          setIsSending(false);
        }
      }
    );
  };



  return (
    <DashboardLayout>
      <Head title="Forum Diskusi & Support - PosFinance Regional IV" />

      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <span>Forum Diskusi & Support Operasional Logistik & Kurir</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Layanan chat langsung Staff ↔ Admin Keuangan, panduan SOP, dan kontak emergency PosFinance.
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="w-full overflow-x-auto no-scrollbar pb-1">
          <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm min-w-max">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat Diskusi (Staff ↔ Admin)</span>
            </button>

            <button
              onClick={() => setActiveTab('sop')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sop'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>SOP & Panduan Kasir POS</span>
            </button>



            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              <span>Kontak Emergency & Helpdesk</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE CHAT STAFF KE UANG AN & ADMIN KEUANGAN */}
        {activeTab === 'chat' && (
          <div className="w-full bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[540px] animate-fadeIn">
            <div>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      Live Chat Diskusi Keuangan
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Saluran Komunikasi Langsung: <span className="text-orange-600 dark:text-orange-400 font-bold">Staff Keuangan ↔ Admin Keuangan</span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Terhubung Sebagai: <strong>{isAdmin ? 'Admin Keuangan' : 'Staff Keuangan'}</strong></span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="space-y-4 overflow-y-auto max-h-[380px] p-2 pr-3">
                {displayMessages.map((m) => {
                  const isMyMessage = m.user_id ? m.user_id === user.id : m.senderRole === (isAdmin ? 'admin' : 'staff');

                  return (
                    <div key={m.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 font-semibold">
                        <span className={m.senderRole === 'admin' ? 'text-orange-500 font-bold' : 'text-blue-500 font-bold'}>
                          {m.senderName}
                        </span>
                        <span>&bull; {m.time}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                        isMyMessage
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Send Input Form */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 mt-4">
              <input
                type="text"
                placeholder={isAdmin ? "Ketik pesan / instruksi ke Staff Keuangan..." : "Ketik pesan / pertanyaan ke Admin Keuangan..."}
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium rounded-2xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !newReplyText.trim()}
                className="px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Kirim'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SOP & PANDUAN KASIR POS */}
        {activeTab === 'sop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pencatatan Transaksi Kasir</h3>
                  <p className="text-xs text-slate-400">Ketentuan Input & Jurnal Transaksi</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Pencatatan Real-time:</strong> Setiap transaksi paket yang diterima langsung dicatat melalui menu Jurnal Transaksi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Integrasi Dashboard:</strong> Seluruh pemasukan ongkir dan pengeluaran asuransi otomatis terakumulasi dalam statistik dashboard.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Aturan Pengeluaran Asuransi Paket</h3>
                  <p className="text-xs text-slate-400">Ketentuan Otomatisasi 2,5% Ongkir</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Saat menambahkan transaksi paket yang diasuransikan, centang opsi <strong>"Tambahkan Pengeluaran Asuransi Paket"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Sistem mengalkulasi biaya asuransi secara **otomatis sebesar 2.5%** dari nominal ongkir pemasukan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Pendapatan Bersih (Net Revenue) dihitung dengan rumus: <strong>Net Revenue = Total Ongkir - Asuransi</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        )}



        {/* TAB 4: KONTAK EMERGENCY & HELPDESK */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Admin PosFinance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Keuangan, Sistem & IT Helpdesk PosFinance</p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono font-bold">
                <div className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <span>📞 +62 812-3456-7890 (Call / WA)</span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>✉️ admin@posindonesia-reg4.co.id</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 dark:bg-[#0B101B] dark:border-[#182232] rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Jam Layanan Helpdesk</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Senin s/d Sabtu (Jam Operasional)</p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400">
                07.00 – 17.00 WIB
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
