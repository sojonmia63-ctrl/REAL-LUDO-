import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Wallet, Ban, CheckCircle, Trash2, Copy, Eye, EyeOff } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, adminUpdateBalance, adminBlockUser, adminUnblockUser, adminDeleteUser } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [showBalance, setShowBalance] = useState<Record<string, boolean>>({});
  const [editBalance, setEditBalance] = useState<Record<string, string>>({});

  const filtered = users.filter((u) => {
    const isBlocked = Boolean(u.isBlocked || (u as any).status === 'blocked');
    const matchFilter = filter === 'all' || (filter === 'blocked' ? isBlocked : !isBlocked);
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.mobile.includes(q) || u.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleSaveBalance = async (userId: string) => {
    const val = Number(editBalance[userId]);
    if (isNaN(val)) return;
    if (!confirm(`ব্যালেন্স ৳${val} করে দিবেন?`)) return;
    await adminUpdateBalance(userId, val, 'Admin manual update');
    setEditBalance((prev) => ({ ...prev, [userId]: '' }));
  };

  const handleBlockToggle = async (u: any) => {
    const isBlocked = Boolean(u.isBlocked || u.status === 'blocked');
    if (isBlocked) {
      if (!confirm(`${u.name} কে Unblock করবেন?`)) return;
      await adminUnblockUser(u.id);
    } else {
      if (!confirm(`${u.name} কে Block করবেন?`)) return;
      await adminBlockUser(u.id);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`${u.name} কে একদম ডিলিট করবেন? এইটা ফেরত আসবে না।`)) return;
    await adminDeleteUser(u.id);
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-neutral-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, মোবাইল, ID দিয়ে খুঁজুন..." className="bg-transparent outline-none text-xs text-white w-full placeholder:text-neutral-500" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'blocked'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${filter === f ? 'bg-[#FF1E3C] text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              {f === 'all' ? 'সব' : f === 'active' ? 'Active' : 'Blocked'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-500">কোনো ইউজার পাওয়া যায়নি</div>}
        {filtered.map((u: any) => {
          const isBlocked = Boolean(u.isBlocked || u.status === 'blocked');
          const bal = Number(u.balance) || 0;
          return (
            <div key={u.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#FF1E3C]/15 border border-[#FF1E3C]/20 flex items-center justify-center text-sm font-black text-white">{u.name?.charAt(0) || 'U'}</div>
                  <div>
                    <p className="text-sm font-black text-white flex items-center gap-2">{u.name} {isBlocked && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">BLOCKED</span>}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{u.mobile} • ID: {u.id}</p>
                    <p className="text-[11px] text-neutral-500">জয়েন: {u.joinedAt || '-'} • ম্যাচ: {u.matchesPlayed || 0} • মোট জয়: ৳{Number(u.totalWon || 0).toLocaleString('en-US')}</p>
                    <button onClick={() => navigator.clipboard?.writeText(u.referCode || u.id)} className="mt-1 text-[11px] font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-lg text-amber-300 flex items-center gap-1 cursor-pointer">Refer: {u.referCode || u.id} <Copy className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <p className="text-base font-black text-emerald-400">৳{showBalance[u.id] ? bal.toLocaleString('en-US') : '••••'}</p>
                    <button onClick={() => setShowBalance((p) => ({ ...p, [u.id]: !p[u.id] }))} className="text-neutral-500 cursor-pointer">{showBalance[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Referrals: {u.referralsCount || 0} • Earn: ৳{Number(u.referralEarnings || 0).toLocaleString('en-US')}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <div className="flex gap-2 flex-1">
                  <input value={editBalance[u.id] ?? ''} onChange={(e) => setEditBalance((p) => ({ ...p, [u.id]: e.target.value }))} type="number" placeholder="নতুন ব্যালেন্স" className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-500" />
                  <button onClick={() => handleSaveBalance(u.id)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer">Save</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleBlockToggle(u)} className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-black cursor-pointer ${isBlocked ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>{isBlocked ? <><CheckCircle className="w-4 h-4" /> Unblock</> : <><Ban className="w-4 h-4" /> Block</>}</button>
                  <button onClick={() => handleDelete(u)} className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-black cursor-pointer"><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
