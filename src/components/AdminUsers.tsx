import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { rtdb } from '../../firebase';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  FileCheck2,
  UserX,
  UserCheck,
  X,
  Ban,
  AlertTriangle,
  RefreshCw,
  Phone,
  Trophy
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const {
    users,
    adminUpdateBalance,
    adminBlockUser,
    adminUnblockUser,
    adminDeleteUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'active' | 'blocked' | 'all'>('active');

  // Modals state
  const [editingBalanceUser, setEditingBalanceUser] = useState<User | null>(null);
  const [balanceChangeAmount, setBalanceChangeAmount] = useState<number | ''>(50);
  const [balanceChangeType, setBalanceChangeType] = useState<'add' | 'deduct'>('add');
  const [balanceNote, setBalanceNote] = useState('');
  const [viewingKycUser, setViewingKycUser] = useState<User | null>(null);

  // In-DOM Confirmation Modals (Never use window.confirm which is blocked in iframes!)
  const [confirmBlockUser, setConfirmBlockUser] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  // Loading States for individual user actions
  const [processingUserIds, setProcessingUserIds] = useState<Record<string, 'block' | 'unblock' | 'delete' | boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User counts
  const blockedUsers = users.filter(u => u && (u.isBlocked || u.status === 'blocked'));
  const activeUsers = users.filter(u => u && !u.isBlocked && u.status !== 'blocked');
  const blockedCount = blockedUsers.length;
  const activeCount = activeUsers.length;
  const totalCount = users.length;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const isUserBlocked = Boolean(u.isBlocked || u.status === 'blocked');

    // Tab filtering
    if (filterTab === 'blocked' && !isUserBlocked) return false;
    if (filterTab === 'active' && isUserBlocked) return false;

    // Search query matching
    const mobile = String(u.mobile || '');
    const id = String(u.id || '').toLowerCase();
    const name = String(u.name || '').toLowerCase();
    return !q || mobile.includes(q) || id.includes(q) || name.includes(q);
  });

  // 1. Balance Update
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBalanceUser || !balanceChangeAmount) return;

    const current = editingBalanceUser.balance || 0;
    const change = Number(balanceChangeAmount);
    const newBal = balanceChangeType === 'add' ? current + change : Math.max(0, current - change);

    await adminUpdateBalance(editingBalanceUser.id, newBal, balanceNote || `Admin manual ${balanceChangeType}`);
    showToast(`✅ ${editingBalanceUser.name} এর নতুন ব্যালেন্স: ৳${newBal}`);
    setEditingBalanceUser(null);
    setBalanceChangeAmount(50);
    setBalanceNote('');
  };

  // 2. Block User Confirmation & Execution
  const handleConfirmBlock = async () => {
    if (!confirmBlockUser) return;
    const userToBlock = confirmBlockUser;
    console.log("Confirming block for user:", userToBlock.id, userToBlock.name);

    setProcessingUserIds(prev => ({ ...prev, [userToBlock.id]: 'block' }));
    try {
      // 1. Update in Firebase RTDB users/{uid}/status = "blocked" and isBlocked = true
      await Promise.all([
        rtdb.update(`users/${userToBlock.id}`, {
          status: 'blocked',
          isBlocked: true,
          updatedAt: Date.now()
        }),
        adminBlockUser(userToBlock.id)
      ]);

      showToast(`🚫 ইউজার "${userToBlock.name}" (${userToBlock.mobile}) কে সফলভাবে ব্লক করা হয়েছে।`);
    } catch (err) {
      console.error("Block failed:", err);
      showToast(`❌ ইউজার ব্লক করতে সমস্যা হয়েছে।`, 'error');
    } finally {
      setProcessingUserIds(prev => ({ ...prev, [userToBlock.id]: false }));
      setConfirmBlockUser(null);
    }
  };

  // 3. Unblock User Direct Action (for users in Block List)
  const handleUnblock = async (u: User) => {
    console.log("Unblocking user:", u.id, u.name);
    setProcessingUserIds(prev => ({ ...prev, [u.id]: 'unblock' }));

    try {
      // Update in Firebase RTDB users/{uid}/status = "active" and isBlocked = false
      await Promise.all([
        rtdb.update(`users/${u.id}`, {
          status: 'active',
          isBlocked: false,
          updatedAt: Date.now()
        }),
        adminUnblockUser(u.id)
      ]);

      showToast(`✅ "${u.name}" কে আনব্লক করা হয়েছে এবং অ্যাক্টিভ লিস্টে ফিরিয়ে নেওয়া হয়েছে।`);
    } catch (err) {
      console.error("Unblock failed:", err);
      showToast(`❌ ইউজার আনব্লক করতে সমস্যা হয়েছে।`, 'error');
    } finally {
      setProcessingUserIds(prev => ({ ...prev, [u.id]: false }));
    }
  };

  // 4. Delete User Confirmation & Execution
  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    const userToDelete = confirmDeleteUser;
    console.log("Confirming delete for user:", userToDelete.id, userToDelete.name);

    setProcessingUserIds(prev => ({ ...prev, [userToDelete.id]: 'delete' }));
    try {
      await adminDeleteUser(userToDelete.id);
      showToast(`🗑️ ইউজার "${userToDelete.name}" এর অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(`❌ ইউজার ডিলিট করতে সমস্যা হয়েছে।`, 'error');
    } finally {
      setProcessingUserIds(prev => ({ ...prev, [userToDelete.id]: false }));
      setConfirmDeleteUser(null);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>ইউজার ম্যানেজমেন্ট ও ব্লক লিস্ট</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            সক্রিয় ইউজার মনিটর করুন, ব্লক করুন অথবা ব্লক লিস্ট থেকে তাৎক্ষণিক আনব্লক করুন
          </p>
        </div>

        {/* Section Tabs (Active / Block List / All) */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>অ্যাক্টিভ ইউজার ({activeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('blocked')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'blocked'
                ? 'bg-red-600 text-white shadow-lg ring-1 ring-red-400'
                : 'text-red-400 hover:bg-neutral-800 hover:text-red-300'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>ব্লক লিস্ট ({blockedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'all'
                ? 'bg-neutral-700 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>সব ইউজার ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="মোবাইল নম্বর (০১...), গেম আইডি (RL-...) অথবা ইউজারের নাম দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-white text-xs"
          >
            ক্লিয়ার
          </button>
        )}
      </div>

      {/* Feedback Toast Notification */}
      {feedbackMsg && (
        <div className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 border animate-fade-in ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            : 'bg-red-950/90 border-red-500 text-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ================= IN-DOM BLOCK CONFIRMATION MODAL ================= */}
      {confirmBlockUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/50 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-red-400 border-b border-neutral-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-600/50 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">ইউজার ব্লক কনফার্মেশন</h3>
                <p className="text-[11px] text-neutral-400">অ্যাকাউন্ট সাময়িক বা স্থায়ী স্থগিত</p>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">ইউজার নাম:</span>
                <span className="font-bold text-white">{confirmBlockUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">মোবাইল নম্বর:</span>
                <span className="font-mono text-amber-300 font-bold">{confirmBlockUser.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">গেম আইডি:</span>
                <span className="font-mono text-sky-300">{confirmBlockUser.id}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              আপনি কি নিশ্চিত যে এই ইউজারকে <b>ব্লক করতে চান</b>? ব্লক করলে ইউজার অ্যাপে লগইন বা কোনো টুর্নামেন্টে খেলতে পারবে না।
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBlockUser(null)}
                disabled={Boolean(processingUserIds[confirmBlockUser.id])}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={Boolean(processingUserIds[confirmBlockUser.id])}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95"
              >
                {processingUserIds[confirmBlockUser.id] === 'block' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>নিশ্চিত ব্লক করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= IN-DOM DELETE CONFIRMATION MODAL ================= */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-700/60 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-red-500 border-b border-neutral-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">ইউজার ডিলিট সতর্কতা</h3>
                <p className="text-[11px] text-red-300">আপনি কি নিশ্চিত?</p>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">ইউজার নাম:</span>
                <span className="font-bold text-white">{confirmDeleteUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">মোবাইল:</span>
                <span className="font-mono text-amber-300 font-bold">{confirmDeleteUser.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">ব্যালেন্স:</span>
                <span className="font-black text-emerald-400">৳{confirmDeleteUser.balance}</span>
              </div>
            </div>

            <p className="text-xs text-red-200 leading-relaxed bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
              ⚠️ সতর্কবার্তা: এই অ্যাকাউন্টটি ফায়ারবেস ডেটাবেজ ও সার্ভার থেকে স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়!
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={Boolean(processingUserIds[confirmDeleteUser.id])}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(processingUserIds[confirmDeleteUser.id])}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95"
              >
                {processingUserIds[confirmDeleteUser.id] === 'delete' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, ডিলিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BALANCE EDIT MODAL ================= */}
      {editingBalanceUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">ব্যালেন্স এডিট করুন</h3>
                <p className="text-xs text-neutral-400">{editingBalanceUser.name} ({editingBalanceUser.mobile})</p>
              </div>
              <button
                onClick={() => setEditingBalanceUser(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-neutral-900 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-neutral-400">বর্তমান ব্যালেন্স:</span>
              <span className="text-base font-black text-amber-300">৳{editingBalanceUser.balance}</span>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1 block">অ্যাকশন টাইপ</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceChangeType('add')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      balanceChangeType === 'add' ? 'bg-emerald-600 text-white shadow' : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> টাকা যোগ (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceChangeType('deduct')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      balanceChangeType === 'deduct' ? 'bg-red-600 text-white shadow' : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> টাকা কমান (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1 block">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  min={1}
                  value={balanceChangeAmount}
                  onChange={(e) => setBalanceChangeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="পরিমাণ দিন"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1 block">নোট বা কারণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder="যেমন: রেফারেল বোনাস / রিফান্ড"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBalanceUser(null)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF1E3C] hover:bg-[#e01431] text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= KYC VIEW MODAL ================= */}
      {viewingKycUser && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>কেওয়াইসি ও এনআইডি ডকুমেন্ট</span>
                </h3>
                <p className="text-xs text-neutral-400">{viewingKycUser.name} ({viewingKycUser.id})</p>
              </div>
              <button onClick={() => setViewingKycUser(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-neutral-300 block mb-1">🪪 NID সামনে (Front):</span>
                {viewingKycUser.nidFront ? (
                  <img src={viewingKycUser.nidFront} alt="NID Front" className="w-full rounded-xl border border-neutral-700" />
                ) : (
                  <p className="text-xs text-neutral-500 bg-neutral-900 p-3 rounded-xl text-center">আপলোড করা হয়নি</p>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-300 block mb-1">🪪 NID পিছনে (Back):</span>
                {viewingKycUser.nidBack ? (
                  <img src={viewingKycUser.nidBack} alt="NID Back" className="w-full rounded-xl border border-neutral-700" />
                ) : (
                  <p className="text-xs text-neutral-500 bg-neutral-900 p-3 rounded-xl text-center">আপলোড করা হয়নি</p>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-300 block mb-1">🤳 Selfie + NID হাতে:</span>
                {viewingKycUser.selfieWithNid ? (
                  <img src={viewingKycUser.selfieWithNid} alt="Selfie" className="w-full rounded-xl border border-neutral-700" />
                ) : (
                  <p className="text-xs text-neutral-500 bg-neutral-900 p-3 rounded-xl text-center">আপলোড করা হয়নি</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingKycUser(null)}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* ================= USERS TABLE ================= */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-700">
              <tr>
                <th className="px-4 py-3">গেম আইডি</th>
                <th className="px-4 py-3">নাম ও মোবাইল</th>
                <th className="px-4 py-3">ব্যালেন্স</th>
                <th className="px-4 py-3">মোট জয় / রেফারেল</th>
                <th className="px-4 py-3">ম্যাচ</th>
                <th className="px-4 py-3">কেওয়াইসি</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/60 text-neutral-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-neutral-400">
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-300">
                        {filterTab === 'blocked' ? 'ব্লক লিস্টে কোনো ইউজার নেই' : 'কোনো ইউজার পাওয়া যায়নি'}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {filterTab === 'blocked' ? 'বর্তমানে কোনো ইউজার ব্লক অবস্থায় নেই' : 'সার্চ কোয়েরি পরিবর্তন করে আবার চেষ্টা করুন'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUserBlocked = Boolean(u.isBlocked || u.status === 'blocked');
                  const isActionProcessing = Boolean(processingUserIds[u.id]);
                  const currentAction = processingUserIds[u.id];

                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        isUserBlocked
                          ? 'bg-red-950/20 hover:bg-red-950/30 border-l-2 border-l-red-500'
                          : 'hover:bg-neutral-700/30'
                      }`}
                    >
                      {/* Game ID */}
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {u.id}
                      </td>

                      {/* Name & Mobile */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.deviceOwner && (
                            <span className="text-[9px] bg-neutral-700 text-neutral-300 px-1 rounded">ডিভাইস ওনার</span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{u.mobile}</span>
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-emerald-400 text-sm">৳{u.balance}</span>
                          <button
                            type="button"
                            onClick={() => setEditingBalanceUser(u)}
                            className="bg-neutral-700 hover:bg-neutral-600 text-amber-300 p-1 rounded-md text-[10px] font-bold cursor-pointer transition-all"
                            title="ব্যালেন্স এডিট করুন"
                          >
                            <DollarSign className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Total Won & Referrals */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span>৳{u.totalWon || 0}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          রেফারেল: <b className="text-neutral-300">{u.referralsCount || 0} জন</b> (৳{u.referralEarnings || 0})
                        </div>
                      </td>

                      {/* Matches Played */}
                      <td className="px-4 py-3 text-neutral-300">
                        {u.matchesPlayed || 0} টি
                      </td>

                      {/* KYC Document */}
                      <td className="px-4 py-3">
                        {u.nidFront || u.nidBack || u.selfieWithNid ? (
                          <button
                            type="button"
                            onClick={() => setViewingKycUser(u)}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-emerald-900 transition-all"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>ডকুমেন্ট</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-500">নেই</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        {isUserBlocked ? (
                          <span className="bg-red-950 text-red-300 border border-red-700/60 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                            <Ban className="w-3 h-3 text-red-400" />
                            <span>ব্লকড (Blocked)</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>সক্রিয় (Active)</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Unblock Button for Blocked Users */}
                          {isUserBlocked ? (
                            <button
                              type="button"
                              onClick={() => handleUnblock(u)}
                              disabled={isActionProcessing}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95 ${
                                currentAction === 'unblock'
                                  ? 'bg-amber-600 text-white cursor-wait opacity-90'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                              title="ইউজারকে আনব্লক করে অ্যাক্টিভ লিস্টে নিন"
                            >
                              {currentAction === 'unblock' ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Unblock</span>
                                </>
                              )}
                            </button>
                          ) : (
                            /* Block Button for Active Users */
                            <button
                              type="button"
                              onClick={() => setConfirmBlockUser(u)}
                              disabled={isActionProcessing}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95 ${
                                currentAction === 'block'
                                  ? 'bg-amber-600 text-white cursor-wait opacity-90'
                                  : 'bg-red-700 hover:bg-red-600 text-white'
                              }`}
                              title="ইউজার অ্যাকাউন্ট ব্লক করুন"
                            >
                              {currentAction === 'block' ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Block</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Delete Button with In-DOM Confirmation */}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteUser(u)}
                            disabled={isActionProcessing}
                            className="bg-neutral-700 hover:bg-red-800 text-neutral-300 hover:text-white p-1.5 rounded-lg text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                            title="ইউজার অ্যাকাউন্ট মুছে ফেলুন"
                          >
                            {currentAction === 'delete' ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
