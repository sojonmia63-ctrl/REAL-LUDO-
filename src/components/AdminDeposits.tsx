import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, X, Search, Copy } from 'lucide-react';

export const AdminDeposits: React.FC = () => {
  const { depositRequests, adminApproveDeposit, adminRejectDeposit } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const filtered = depositRequests.filter((d) => {
    const matchFilter = filter === 'all' || d.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.userName.toLowerCase().includes(q) || d.userMobile.includes(q) || d.trxId.toLowerCase().includes(q) || d.senderMobile.includes(q);
    return matchFilter && matchSearch;
  });
  const handleApprove = async (id: string) => {
    if (!confirm('এই ডিপোজিট Approve করবেন? ইউজারের ব্যালেন্সে টাকা যোগ হয়ে যাবে।')) return;
    setBusyId(id);
    await adminApproveDeposit(id);
    setBusyId(null);
  };
  const handleReject = async (id: string) => {
    if (!confirm('এই ডিপোজিট Reject করবেন?')) return;
    setBusyId(id);
    await adminRejectDeposit(id, 'Admin rejected');
    setBusyId(null);
  };
  return (
    <div className="space-y-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-neutral-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, মোবাইল, TrxID দিয়ে খুঁজুন..." className="bg-transparent outline-none text-xs text-white w-full placeholder:text-neutral-500" />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${filter === f ? 'bg-[#FF1E3C] text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              {f === 'all' ? 'সব' : f === 'pending' ? 'পেন্ডিং' : f === 'approved' ? 'Approved' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center text-xs text-neutral-500">কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি</div>}
        {filtered.map((d) => (
          <div key={d.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{d.userName} <span className="text-[11px] font-bold text-neutral-500">({d.userMobile})</span></p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{d.createdAt} • {d.id}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[11px] font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-lg text-emerald-400">{d.method}</span>
                  <span className="text-[11px] font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-lg text-white">Sender: {d.senderMobile}</span>
                  <button onClick={() => navigator.clipboard?.writeText(d.trxId)} className="text-[11px] font-bold bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-lg text-amber-300 flex items-center gap-1 cursor-pointer">TrxID: {d.trxId} <Copy className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-400">৳{Number(d.amount || 0).toLocaleString('en-US')}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{d.status}</span>
              </div>
            </div>
            {d.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button disabled={busyId === d.id} onClick={() => handleApprove(d.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50"><Check className="w-4 h-4" /> Approve & Add Balance</button>
                <button disabled={busyId === d.id} onClick={() => handleReject(d.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white py-2 rounded-xl text-xs font-black cursor-pointer disabled:opacity-50"><X className="w-4 h-4" /> Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
