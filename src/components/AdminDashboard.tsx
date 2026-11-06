import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AdminTab } from './AdminLayout';
import { Users, ArrowDownCircle, ArrowUpCircle, Trophy, Wallet, ChevronRight } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { users, depositRequests, withdrawRequests, matchClaims, matches, settings } = useApp();
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);
  const pendingDeposits = depositRequests.filter(d => d.status === 'pending');
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'pending');
  const pendingClaims = matchClaims.filter(c => c.status === 'pending');
  const approvedDepositsTotal = depositRequests.filter(d => d.status === 'approved').reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const approvedWithdrawsTotal = withdrawRequests.filter(w => w.status === 'approved').reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const recentDeposits = [...depositRequests].slice(0, 5);
  const recentWithdraws = [...withdrawRequests].slice(0, 5);
  const cards = [
    { title: 'মোট ইউজার', value: String(totalUsers), sub: `মোট ব্যালেন্স: ৳${totalBalance.toLocaleString('en-US')}`, icon: Users, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', tab: 'users' as AdminTab },
    { title: 'পেন্ডিং ডিপোজিট', value: String(pendingDeposits.length), sub: `মোট Approved: ৳${approvedDepositsTotal.toLocaleString('en-US')}`, icon: ArrowDownCircle, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', tab: 'deposits' as AdminTab },
    { title: 'পেন্ডিং উইথড্র', value: String(pendingWithdraws.length), sub: `মোট Approved: ৳${approvedWithdrawsTotal.toLocaleString('en-US')}`, icon: ArrowUpCircle, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', tab: 'withdraws' as AdminTab },
    { title: 'পেন্ডিং ক্লেইম', value: String(pendingClaims.length), sub: `মোট ম্যাচ: ${matches.length} টি`, icon: Trophy, bg: 'bg-[#FF1E3C]/10 text-[#FF1E3C] border-[#FF1E3C]/20', tab: 'claims' as AdminTab },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.title} onClick={() => onNavigateTab(card.tab)} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left hover:border-neutral-700 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.bg}`}><Icon className="w-5 h-5" /></div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </div>
              <p className="text-[11px] text-neutral-400 font-bold mt-3">{card.title}</p>
              <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
              <p className="text-[11px] text-neutral-500 font-semibold mt-1">{card.sub}</p>
            </button>
          );
        })}
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-neutral-400 font-bold">মিন ডিপোজিট:</span>
          <span className="text-xs font-black text-white">৳{(settings as any)?.minDeposit ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-bold">মিন উইথড্র:</span>
          <span className="text-xs font-black text-white">৳{(settings as any)?.minWithdraw ?? 0}</span>
        </div>
        <button onClick={() => onNavigateTab('settings')} className="ml-auto text-xs font-bold bg-[#FF1E3C] hover:bg-red-600 text-white px-3 py-1.5 rounded-lg cursor-pointer">সেটিংস দেখুন</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white">সাম্প্রতিক ডিপোজিট</h3>
            <button onClick={() => onNavigateTab('deposits')} className="text-xs font-bold text-emerald-400 cursor-pointer">সব দেখুন →</button>
          </div>
          <div className="space-y-2">
            {recentDeposits.length === 0 && <p className="text-xs text-neutral-500 py-4 text-center">কোনো ডিপোজিট রিকোয়েস্ট নাই</p>}
            {recentDeposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{d.userName || 'ইউজার'}</p>
                  <p className="text-[11px] text-neutral-500">{d.method} • {d.trxId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-400">৳{Number(d.amount || 0).toLocaleString('en-US')}</p>
                  <p className="text-[10px] font-bold text-amber-400">{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white">সাম্প্রতিক উইথড্র</h3>
            <button onClick={() => onNavigateTab('withdraws')} className="text-xs font-bold text-amber-400 cursor-pointer">সব দেখুন →</button>
          </div>
          <div className="space-y-2">
            {recentWithdraws.length === 0 && <p className="text-xs text-neutral-500 py-4 text-center">কোনো উইথড্র রিকোয়েস্ট নাই</p>}
            {recentWithdraws.map((w) => (
              <div key={w.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{w.userName || 'ইউজার'}</p>
                  <p className="text-[11px] text-neutral-500">{w.method} • {w.receiverNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-amber-400">৳{Number(w.amount || 0).toLocaleString('en-US')}</p>
                  <p className="text-[10px] font-bold text-amber-400">{w.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
