import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Gamepad2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    users,
    depositRequests,
    withdrawRequests,
    matchClaims,
    matches,
    isRtdbConnected,
    isSyncing,
    refreshFromFirebase
  } = useApp();

  const pendingDeposits = depositRequests.filter(d => d.status === 'pending');
  const pendingWithdraws = withdrawRequests.filter(w => w.status === 'pending');
  const pendingClaims = matchClaims.filter(c => c.status === 'pending');
  const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const pendingDepositAmount = pendingDeposits.reduce((acc, d) => acc + d.amount, 0);
  const pendingWithdrawAmount = pendingWithdraws.reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* DB Connection Banner */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">ফায়ারবেস রিয়েল-টাইম ডাটাবেজ</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isRtdbConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {isRtdbConnected ? 'Online & Synced' : 'Connecting...'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5 break-all">
              https://real-ludo-c4611-default-rtdb.firebaseio.com/
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshFromFirebase()}
          disabled={isSyncing}
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'রিফ্রেশ সিঙ্ক'}</span>
        </button>
      </div>

      {/* Source Code Download Quick Card (Point 14) */}
      <div className="bg-gradient-to-r from-red-950/70 via-neutral-900 to-amber-950/70 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
              Point 14 • সোর্স কোড ডাউনলোড
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Acode & VS Code Ready</span>
          </div>
          <h3 className="text-white font-black text-sm sm:text-base flex items-center gap-2">
            <span>📦 সম্পূর্ণ সোর্স কোড ডাউনলোড (.ZIP)</span>
          </h3>
          <p className="text-xs text-neutral-300 max-w-xl">
            অ্যান্ড্রয়েড অ্যাপ ও অ্যাডমিন প্যানেলের সমস্ত React, HTML, CSS ও Firebase ব্যাকএন্ড কোড একটি জিপ ফাইলে ডাউনলোড করুন।
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('source')}
          className="bg-[#FF1E3C] hover:bg-[#e01431] text-white text-xs px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer shrink-0"
        >
          <span>সোর্স কোড সেকশনে যান</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 hover:border-neutral-500 transition-all cursor-pointer shadow group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-neutral-400 uppercase">মোট ইউজার</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-white">{users.length}</span>
            <span className="text-xs text-neutral-400 ml-1">জন</span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>ইউজার ম্যানেজ করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Total Wallet Balance */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-neutral-400 uppercase">ইউজারদের মোট ব্যালেন্স</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-amber-400">৳{totalBalance}</span>
          </div>
          <p className="mt-3 pt-2 border-t border-neutral-700/60 text-xs text-neutral-400">
            বর্তমানে মোট সঞ্চিত ব্যালেন্স
          </p>
        </div>

        {/* Pending Deposits */}
        <div
          onClick={() => onNavigateTab('deposits')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer shadow group ${
            pendingDeposits.length > 0
              ? 'bg-emerald-950/40 border-emerald-600/60 hover:border-emerald-400'
              : 'bg-neutral-800 border-neutral-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-400 uppercase">পেন্ডিং ডিপোজিট</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingDeposits.length}</span>
            <span className="text-xs text-emerald-400 font-bold">(৳{pendingDepositAmount})</span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>{pendingDeposits.length > 0 ? 'অনুমোদন দিন' : 'সব দেখা হয়েছে'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pending Withdraws */}
        <div
          onClick={() => onNavigateTab('withdraws')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer shadow group ${
            pendingWithdraws.length > 0
              ? 'bg-red-950/40 border-red-600/60 hover:border-red-400'
              : 'bg-neutral-800 border-neutral-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-red-400 uppercase">পেন্ডিং উইথড্র</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingWithdraws.length}</span>
            <span className="text-xs text-red-400 font-bold">(৳{pendingWithdrawAmount})</span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-red-400 group-hover:translate-x-1 transition-transform">
            <span>{pendingWithdraws.length > 0 ? 'পেমেন্ট ক্লিয়ার করুন' : 'সব ক্লিয়ার'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pending Match Claims (Point 2) */}
        <div
          onClick={() => onNavigateTab('claims')}
          className={`border rounded-2xl p-4 transition-all cursor-pointer shadow group ${
            pendingClaims.length > 0
              ? 'bg-amber-950/40 border-amber-500/60 hover:border-amber-400'
              : 'bg-neutral-800 border-neutral-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-400 uppercase">ম্যাচ রেজাল্ট ক্লেইম</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingClaims.length}</span>
            <span className="text-xs text-amber-400 font-bold">টি স্ক্রিনশট</span>
          </div>
          <div className="mt-3 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>{pendingClaims.length > 0 ? 'স্ক্রিনশট যাচাই করুন' : 'সব যাচাইকৃত'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Action Tables (Recent Pending Requests) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Deposits */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>সাম্প্রতিক ডিপোজিট রিকোয়েস্ট</span>
            </h4>
            <button
              onClick={() => onNavigateTab('deposits')}
              className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              সবগুলো দেখুন ({depositRequests.length})
            </button>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs bg-neutral-900/50 rounded-xl">
              বর্তমানে কোনো পেন্ডিং ডিপোজিট নেই 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDeposits.slice(0, 4).map((d) => (
                <div key={d.id} className="bg-neutral-900 border border-neutral-700/60 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{d.userName}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{d.userMobile}</span>
                      <span className="text-[10px] bg-pink-900/60 text-pink-300 px-1.5 py-0.2 rounded font-bold">
                        {d.method}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-300 font-mono mt-0.5">
                      TrxID: <span className="text-amber-300 font-bold">{d.trxId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-400 block">+৳{d.amount}</span>
                    <button
                      onClick={() => onNavigateTab('deposits')}
                      className="text-[10px] text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-700 mt-1 cursor-pointer"
                    >
                      Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pending Withdrawals */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span>সাম্প্রতিক উইথড্র রিকোয়েস্ট</span>
            </h4>
            <button
              onClick={() => onNavigateTab('withdraws')}
              className="text-xs text-red-400 hover:underline font-semibold cursor-pointer"
            >
              সবগুলো দেখুন ({withdrawRequests.length})
            </button>
          </div>

          {pendingWithdraws.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs bg-neutral-900/50 rounded-xl">
              বর্তমানে কোনো পেন্ডিং উইথড্র নেই
            </div>
          ) : (
            <div className="space-y-2">
              {pendingWithdraws.slice(0, 4).map((w) => (
                <div key={w.id} className="bg-neutral-900 border border-neutral-700/60 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{w.userName}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{w.receiverNumber}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {w.method} ({w.accountType})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-400 block">৳{w.amount}</span>
                    <button
                      onClick={() => onNavigateTab('withdraws')}
                      className="text-[10px] text-red-400 bg-red-950/80 hover:bg-red-900 px-2 py-0.5 rounded border border-red-700 mt-1 cursor-pointer"
                    >
                      Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
