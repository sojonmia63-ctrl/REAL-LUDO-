import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { rtdb } from '../../firebase';
import {
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  CreditCard
} from 'lucide-react';

export const AdminWithdraws: React.FC = () => {
  const { withdrawRequests, adminApproveWithdraw, adminRejectWithdraw } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Loading and approval states for instant feedback
  const [processingWithdrawIds, setProcessingWithdrawIds] = useState<Record<string, boolean>>({});
  const [approvedWithdrawIds, setApprovedWithdrawIds] = useState<Record<string, boolean>>({});

  const filtered = withdrawRequests.filter(w => {
    const matchesSearch =
      w.receiverNumber.includes(searchQuery) ||
      w.userMobile.includes(searchQuery) ||
      w.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string, userName: string, amount: number, receiver: string) => {
    console.log("approve withdraw clicked", { id, userName, amount, receiver });
    if (processingWithdrawIds[id]) return;

    setProcessingWithdrawIds(prev => ({ ...prev, [id]: true }));
    setActionSuccessMsg(`⏳ ${receiver} নাম্বারে ৳${amount} উইথড্র রিকোয়েস্ট অনুমোদন প্রসেস করা হচ্ছে...`);

    try {
      await Promise.all([
        rtdb.update(`withdraws/${id}`, {
          status: 'approved',
          reviewedAt: new Date().toLocaleString('bn-BD'),
          updatedAt: Date.now()
        }).catch(() => {}),
        rtdb.update(`withdrawRequests/${id}`, {
          status: 'approved',
          reviewedAt: new Date().toLocaleString('bn-BD'),
          updatedAt: Date.now()
        }).catch(() => {})
      ]);

      const res = await adminApproveWithdraw(id);
      setApprovedWithdrawIds(prev => ({ ...prev, [id]: true }));
      setActionSuccessMsg(`✅ ৳${amount} উইথড্র রিকোয়েস্ট সফলভাবে পরিশোধ সম্পন্ন (Approved) হয়েছে!`);
    } catch (err) {
      console.error("Error approving withdraw:", err);
      setActionSuccessMsg(`❌ উইথড্র সম্পন্ন করতে সমস্যা হয়েছে।`);
    } finally {
      setProcessingWithdrawIds(prev => ({ ...prev, [id]: false }));
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    await adminRejectWithdraw(rejectingId, rejectNote || 'ভুল নম্বর বা শর্তাবলী পূরণ হয়নি');
    setRejectingId(null);
    setRejectNote('');
    setActionSuccessMsg('❌ উইথড্র রিকোয়েস্ট বাতিল করা হয়েছে এবং টাকা ইউজারের অ্যাকাউন্টে ফেরত দেওয়া হয়েছে।');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-red-400" />
            <span>উইথড্র রিকোয়েস্ট ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            ইউজারদের উইথড্র চেক করুন। রিজেক্ট করলে টাকা স্বয়ংক্রিয়ভাবে ইউজারের ব্যালেন্সে ফেরত যাবে
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
            সব ({withdrawRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'pending' ? 'bg-red-500 text-white font-black' : 'text-red-400 hover:text-red-300'
            }`}
          >
            পেন্ডিং ({withdrawRequests.filter(w => w.status?.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            পরিশোধিত
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'rejected' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-neutral-300'
            }`}
          >
            বাতিল
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="প্রাপক মোবাইল নম্বর অথবা ইউজার নাম দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-red-500"
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
            <h3 className="font-bold text-white text-sm">উইথড্র বাতিলের কারণ</h3>
            <p className="text-xs text-neutral-400">বাতিল করলে ইউজারের ব্যালেন্স স্বয়ংক্রিয়ভাবে রিফান্ড হয়ে যাবে।</p>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="যেমন: ভুল বা বন্ধ বিকাশ নম্বর"
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
                রিজেক্ট ও রিফান্ড
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
                <th className="px-4 py-3">ইউজার</th>
                <th className="px-4 py-3">মেথড ও টাইপ</th>
                <th className="px-4 py-3">প্রাপক নাম্বার</th>
                <th className="px-4 py-3">উইথড্র পরিমাণ</th>
                <th className="px-4 py-3">তারিখ ও সময়</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/60 text-neutral-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-neutral-400">
                    কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{w.userName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{w.userMobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">{w.method}</span>
                      <span className="text-[10px] text-neutral-400 block">{w.accountType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-300 text-sm select-all">
                      {w.receiverNumber}
                    </td>
                    <td className="px-4 py-3 font-black text-red-400 text-sm">
                      ৳{w.amount}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-[11px]">
                      {w.createdAt}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'pending' && (
                        <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-600/60 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> অপেক্ষমান
                        </span>
                      )}
                      {w.status === 'approved' && (
                        <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-600/60 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> পরিশোধিত
                        </span>
                      )}
                      {w.status === 'rejected' && (
                        <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-600/60 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> বাতিল (রিফান্ড)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {w.status?.toLowerCase() === 'pending' && !approvedWithdrawIds[w.id] ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(w.id, w.userName, w.amount, w.receiverNumber)}
                            disabled={processingWithdrawIds[w.id]}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                              processingWithdrawIds[w.id]
                                ? 'bg-amber-600 text-white cursor-wait opacity-90'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                            title="টাকা পাঠিয়ে দিয়েছি, সম্পন্ন করুন"
                          >
                            {processingWithdrawIds[w.id] ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>পরিশোধ সম্পন্ন</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(w.id)}
                            disabled={processingWithdrawIds[w.id]}
                            className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="বাতিল ও টাকা ফেরত"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{approvedWithdrawIds[w.id] || w.status === 'approved' ? 'পরিশোধিত (Completed)' : 'বাতিল (রিফান্ড)'}</span>
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
