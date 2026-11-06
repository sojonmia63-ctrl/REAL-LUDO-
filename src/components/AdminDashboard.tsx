import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AdminTab } from './AdminLayout';
import { ArrowDownCircle, ArrowUpCircle, Trophy, Users, Wallet, Gamepad2, Eye } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { depositRequests, withdrawRequests, matchClaims, users, matches } = useApp();

  const pendingDeposits = depositRequests.filter(d => d.status === 'pending');
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'pending');
  const pendingClaims = matchClaims.filter(c => c.status === 'pending');

  const totalDepositPending = pendingDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalWithdrawPending = pendingWithdraws.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const totalUserBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);
  const activeMatches = matches.filter(m => m.status !== 'finished' && m.status !== 'cancelled').length;

  const cards = [
    {
      title: 'পেন্ডিং ডিপোজিট',
      value: `${pendingDeposits.length} টা`,
      sub: `মোট ৳${totalDepositPending.toLocaleString('en-US')} আটকে আছে`,
      icon: ArrowDownCircle,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tab: 'deposits' as AdminTab,
      btn: 'ডিপোজিট দেখুন',
    },
    {
      title: 'পেন্ডিং উইথড্র',
      value: `${pendingWithdraws.length} টা`,
      sub: `মোট ৳${totalWithdrawPending.toLocaleString('en-US')} দিতে হবে`,
      icon: ArrowUpCircle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tab: 'withdraws' as AdminTab,
      btn: 'উইথড্র দেখুন',
    },
    {
      title: 'পেন্ডিং ক্লেইম',
      value: `${pendingClaims.length} টা`,
      sub: 'ম্যাচ রেজাল্ট ও প্রুফ চেক করুন',
      icon: Trophy,
      color: 'text-[#FF1E3C] bg-[#FF1E3C]/10 border-[#FF1E3C]/20',
      tab: 'claims' as AdminTab,
      btn: 'ক্লেইম দেখুন',
    },
    {
      title: 'মোট ইউজার',
      value: `${users.length} জন`,
      sub: `মোট ব্যালেন্স ৳${totalUserBalance.toLocaleString('en-US')}`,
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tab: 'users' as AdminTab,
      btn: 'ইউজার দেখুন',
    },
  ];

  const recentDeposits = [...depositRequests].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  const recentWithdraws = [...withdrawRequests].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-neutral-500">{c.title}</p>
                  <p className="text-xl font-black text-white mt-1">{c.value}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={() => onNavigateTab(c.tab)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-white py-2 rounded-xl text-xs font-black cursor-pointer transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> {c.btn}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Info Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF1E3C]/10 border border-[#FF1E3C]/20 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-[#FF1E3C]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-500">অ্যাক্টিভ ম্যাচ</p>
            <p className="text-base font-black text-white">{activeMatches} টা চলছে</p>
          </div>
          <button onClick={() => onNavigateTab('matches')} className="ml-auto text-xs font-black bg-[#FF1E3C] hover:bg-[#e01533] text-white px-3 py-2 rounded-xl cursor-pointer">ম্যাচ</button>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-500">সেটিংস</p>
            <p className="text-base font-black text-white">লোগো, লিমিট</p>
          </div>
          <button onClick={() => onNavigateTab('settings')} className="ml-auto text-xs font-black bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-xl cursor-pointer">সেটিংস</button>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white">লাস্ট ৫টা ডিপোজিট</h3>
            <button onClick={() => onNavigateTab('deposits')} className="text-[11px] font-bold text-[#FF1E3C] cursor-pointer">সব দেখুন →</button>
          </div>
          <div className="space-y-2">
            {recentDeposits.length === 0 && <p className="text-xs text-neutral-500 text-center py-4">কোনো ডিপোজিট নাই</p>}
            {recentDeposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{d.userName} <span className="text-neutral-500 font-semibold">({d.userMobile})</span></p>
                  <p className="text-[11px] text-neutral-500">{d.method} • {d.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-400">৳{Number(d.amount || 0).toLocaleString('en-US')}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white">লাস্ট ৫টা উইথড্র</h3>
            <button onClick={() => onNavigateTab('withdraws')} className="text-[11px] font-bold text-[#FF1E3C] cursor-pointer">সব দেখুন →</button>
          </div>
          <div className="space-y-2">
            {recentWithdraws.length === 0 && <p className="text-xs text-neutral-500 text-center py-4">কোনো উইথড্র নাই</p>}
            {recentWithdraws.map((w) => (
              <div key={w.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{w.userName} <span className="text-neutral-500 font-semibold">({w.userMobile})</span></p>
                  <p className="text-[11px] text-neutral-500">{w.method} • {w.receiverNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-400">৳{Number(w.amount || 0).toLocaleString('en-US')}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${w.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{w.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
