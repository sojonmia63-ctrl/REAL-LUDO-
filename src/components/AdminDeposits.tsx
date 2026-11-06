import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  User,
  Check,
  X
} from 'lucide-react';

export const AdminDeposits: React.FC = () => {
  const { depositRequests, adminApproveDeposit, adminRejectDeposit } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Loading and approval states for instant feedback
  const [processingDepositIds, setProcessingDepositIds] = useState<Record<string, boolean>>({});
  const [approvedDepositIds, setApprovedDepositIds] = useState<Record<string, boolean>>({});

  const filtered = depositRequests.filter(d => {
    const matchesSearch =
      d.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.userMobile.includes(searchQuery) ||
      d.senderMobile.includes(searchQuery) ||
      d.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string, userName: string, amount: number) => {
    console.log("approve deposit clicked", { id, userName, amount });
    if (processingDepositIds[id]) return;

    setProcessingDepositIds(prev => ({ ...prev, [id]: true }));
    setActionSuccessMsg(`⏳ ${userName} এর ৳${amount} ডিপোজিট অনুমোদন করা হচ্ছে...`);

    try {
      const res = await adminApproveDeposit(id);
      if (res) {
        setApprovedDepositIds(prev => ({ ...prev, [id]: true }));
        setActionSuccessMsg(`✅ ৳${amount} টাকা ${userName} এর একাউন্টে যুক্ত ও সফলভাবে এপ্রুভ হয়েছে!`);
      }
    } catch (err) {
      console.error("Error approving deposit:", err);
      setActionSuccessMsg(`❌ ডিপোজিট এপ্রুভ করতে সমস্যা হয়েছে।`);
    } finally {
      setProcessingDepositIds(prev => ({ ...prev, [id]: false }));
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    await adminRejectDeposit(rejectingId, rejectNote || 'ভুল বা অমিল TrxID');
    setRejectingId(null);
    setRejectNote('');
    setActionSuccessMsg('❌ ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে।');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6 text-emerald-400" />
            <span>ডিপোজিট রিকোয়েস্ট ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            ইউজারদের পাঠানো TrxID যাচাই করে অনুমোদন (Approve) করলে স্বয়ংক্রিয়ভাবে ব্যালেন্স যোগ হবে
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-neutral-800 p-1 rounded-xl border border-neutral-700 text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'all' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            সব ({depositRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'pending' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            পেন্ডিং ({depositRequests.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            এপ্রুভড
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-300'
            }`}
          >
            বাতিল
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="TrxID, ইউজার ফোন নম্বর অথবা নাম দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {actionSuccessMsg && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-white text-sm">ডিপোজিট বাতিলের কারণ লিখুন</h3>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="যেমন: ভুল TrxID / টাকা আসেনি"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold"
              >
                নিশ্চিত রিজেক্ট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-700">
              <tr>
                <th className="px-4 py-3">ইউজার ও মোবাইল</th>
                <th className="px-4 py-3">মেথড</th>
                <th className="px-4 py-3">প্রেরক নাম্বার</th>
                <th className="px-4 py-3 font-mono">TrxID</th>
                <th className="px-4 py-3">পরিমাণ</th>
                <th className="px-4 py-3">তারিখ ও সময়</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/60 text-neutral-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-400">
                    কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{req.userName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{req.userMobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        req.method === 'bKash' ? 'bg-pink-950 text-pink-300 border border-pink-700/50' : 'bg-orange-950 text-orange-300 border border-orange-700/50'
                      }`}>
                        {req.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-300">
                      {req.senderMobile}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-300 select-all">
                      {req.trxId}
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-400 text-sm">
                      ৳{req.amount}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-[11px]">
                      {req.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'pending' && (
                        <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-600/60 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> পেন্ডিং
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-600/60 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-600/60 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> বাতিল
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'pending' && !approvedDepositIds[req.id] ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(req.id, req.userName, req.amount)}
                            disabled={processingDepositIds[req.id]}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                              processingDepositIds[req.id]
                                ? 'bg-amber-600 text-white cursor-wait opacity-90'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                            title="অনুমোদন করুন ও ব্যালেন্স দিন"
                          >
                            {processingDepositIds[req.id] ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(req.id)}
                            disabled={processingDepositIds[req.id]}
                            className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="বাতিল করুন"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{approvedDepositIds[req.id] || req.status === 'approved' ? 'Approved' : 'বাতিলকৃত'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
