import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const {
    currentUser,
    settings,
    submitDeposit,
    submitWithdraw,
    depositRequests,
    withdrawRequests
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');

  // Deposit form state
  const [depMethod, setDepMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [depSender, setDepSender] = useState(currentUser?.mobile || '');
  const [depAmount, setDepAmount] = useState<number | ''>(settings.minDeposit || 10);
  const [depTrxId, setDepTrxId] = useState('');
  const [depLoading, setDepLoading] = useState(false);
  const [depFeedback, setDepFeedback] = useState<{ msg: string; success: boolean } | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Withdraw form state
  const [withMethod, setWithMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [withType, setWithType] = useState<'Personal' | 'Agent'>('Personal');
  const [withReceiver, setWithReceiver] = useState(currentUser?.mobile || '');
  const [withAmount, setWithAmount] = useState<number | ''>(settings.minWithdraw || 50);
  const [withLoading, setWithLoading] = useState(false);
  const [withFeedback, setWithFeedback] = useState<{ msg: string; success: boolean } | null>(null);

  // Target Payment Number based on method
  const activePayNumber = depMethod === 'bKash'
    ? (settings.bkashNumber || '01610336066')
    : (settings.nagadNumber || '01610336066');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depAmount || depAmount < settings.minDeposit) {
      setDepFeedback({ msg: `সর্বনিম্ন ডিপোজিট ৳${settings.minDeposit}`, success: false });
      return;
    }
    if (!depSender.trim() || !/^01[3-9]\d{8}$/.test(depSender.trim())) {
      setDepFeedback({ msg: 'সঠিক প্রেরক মোবাইল নম্বর দিন', success: false });
      return;
    }
    if (!depTrxId.trim()) {
      setDepFeedback({ msg: 'বিকাশ / নগদ থেকে পাওয়া TrxID দিন', success: false });
      return;
    }

    setDepLoading(true);
    setDepFeedback(null);
    const res = await submitDeposit(depMethod, depSender, Number(depAmount), depTrxId);
    setDepLoading(false);
    setDepFeedback({ msg: res.message, success: res.success });
    if (res.success) {
      setDepTrxId('');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withAmount || withAmount < settings.minWithdraw) {
      setWithFeedback({ msg: `সর্বনিম্ন উইথড্র ৳${settings.minWithdraw}`, success: false });
      return;
    }
    if ((currentUser?.balance || 0) < withAmount) {
      setWithFeedback({ msg: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', success: false });
      return;
    }
    if (!withReceiver.trim() || !/^01[3-9]\d{8}$/.test(withReceiver.trim())) {
      setWithFeedback({ msg: 'সঠিক প্রাপক মোবাইল নম্বর দিন', success: false });
      return;
    }

    setWithLoading(true);
    setWithFeedback(null);
    const res = await submitWithdraw(withMethod, withType, withReceiver, Number(withAmount));
    setWithLoading(false);
    setWithFeedback({ msg: res.message, success: res.success });
  };

  const userDeposits = depositRequests.filter(d => d.userId === currentUser?.id);
  const userWithdraws = withdrawRequests.filter(w => w.userId === currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white text-neutral-900 w-full max-w-md h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-[#FF1E3C] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/90 hover:text-white font-semibold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> পিছনে
          </button>
          <div className="flex items-center gap-1.5 font-bold text-base">
            <Wallet className="w-5 h-5 text-amber-300" />
            <span>ওয়ালেট ও ট্রানজাকশন</span>
          </div>
          <div className="w-8"></div>
        </div>

        {/* User Balance Card */}
        <div className="bg-gradient-to-r from-[#FF1E3C] to-[#8B0000] text-white px-5 py-4 shrink-0 border-t border-red-700/50">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs uppercase text-white/80 font-medium tracking-wide">বর্তমান ব্যালেন্স</span>
              <h2 className="text-3xl font-black text-amber-300 drop-shadow flex items-center gap-1">
                <span className="text-2xl font-bold">৳</span>
                {currentUser?.balance ?? 0}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-white/70 block">Game ID</span>
              <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded font-bold text-amber-200">
                {currentUser?.id || 'RL-000000'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 border-b border-neutral-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'deposit'
                ? 'bg-[#00A651] text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" /> ডিপোজিট (টাকা এড)
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'withdraw'
                ? 'bg-[#FF1E3C] text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" /> উইথড্র (টাকা তুলুন)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-4 h-4" /> ইতিহাস
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ================= 1. DEPOSIT SECTION ================= */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              {/* Payment Method Selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDepMethod('bKash')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    depMethod === 'bKash'
                      ? 'border-[#E2136E] bg-pink-50 text-[#E2136E] ring-2 ring-pink-400'
                      : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E]"></span>
                  বিকাশ (bKash)
                </button>
                <button
                  type="button"
                  onClick={() => setDepMethod('Nagad')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    depMethod === 'Nagad'
                      ? 'border-[#F7941D] bg-orange-50 text-[#F7941D] ring-2 ring-orange-400'
                      : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]"></span>
                  নগদ (Nagad)
                </button>
              </div>

              {/* Explicit Requirement: "bkash pement number" and "01610336066" */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 shadow-sm">
                <div className="text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-100 px-3 py-0.5 rounded-full">
                    {depMethod === 'bKash'
                      ? (settings.bkashLabel || 'bkash pement number')
                      : 'nagad payment number'}
                  </span>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-2xl font-black text-neutral-900 font-mono tracking-wider">
                      {activePayNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activePayNumber)}
                      className="bg-[#FF1E3C] hover:bg-[#e01431] text-white p-2 rounded-xl transition-all shadow active:scale-95 flex items-center gap-1 text-xs font-bold"
                      title="নাম্বার কপি করুন"
                    >
                      {copiedNumber ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    পেমেন্ট করার সময় অবশ্যই সঠিক নম্বরে টাকা পাঠাবেন
                  </p>
                </div>
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-700">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 mb-2">
                  <Info className="w-4 h-4 text-[#FF1E3C]" />
                  <span>{depMethod === 'bKash' ? 'বিকাশ অ্যাপ থেকে পেমেন্ট করার নিয়ম:' : 'নগদ থেকে পেমেন্ট করার নিয়ম:'}</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed whitespace-pre-line text-neutral-600">
                  {settings.paymentInstructions}
                </div>
              </div>

              {/* Deposit Form */}
              <form onSubmit={handleDepositSubmit} className="space-y-3 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                <h4 className="font-bold text-sm text-neutral-900 border-b pb-2">ডিপোজিট তথ্য প্রদান করুন</h4>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">টাকার পরিমাণ (৳)</label>
                  <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                    {[10, 20, 50, 100, 200, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepAmount(amt)}
                        className={`text-xs py-1 px-2.5 rounded-lg font-bold border transition-all shrink-0 cursor-pointer ${
                          depAmount === amt
                            ? 'bg-[#00A651] text-white border-[#00A651]'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={settings.minDeposit}
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={`সর্বনিম্ন ৳${settings.minDeposit}`}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#00A651] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">
                    যে নাম্বার থেকে টাকা পাঠিয়েছেন (Sender Mobile)
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={depSender}
                    onChange={(e) => setDepSender(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#00A651] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">
                    TrxID (ট্রানজাকশন আইডি)
                  </label>
                  <input
                    type="text"
                    value={depTrxId}
                    onChange={(e) => setDepTrxId(e.target.value.toUpperCase())}
                    placeholder="যেমন: BK994KLM77"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-[#00A651] focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    টাকা পাঠানোর পর বিকাশ বা নগদ থেকে আসা SMS এর TrxID এখানে দিন
                  </p>
                </div>

                {depFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      depFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'
                    }`}
                  >
                    {depFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />}
                    <span>{depFeedback.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={depLoading}
                  className="w-full bg-[#00A651] hover:bg-[#008f45] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
                >
                  {depLoading ? 'পাঠানো হচ্ছে...' : '📩 ডিপোজিট রিকোয়েস্ট পাঠান'}
                </button>
              </form>
            </div>
          )}

          {/* ================= 2. WITHDRAW SECTION ================= */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">উইথড্র নিয়মাবলী:</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    সর্বনিম্ন উইথড্র ৳{settings.minWithdraw}। রিকোয়েস্ট পাঠানোর পর অ্যাডমিন অনুমোদনের সাথে সাথে আপনার বিকাশ/নগদে টাকা পাঠিয়ে দেওয়া হবে।
                  </p>
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-3 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">পেমেন্ট মেথড</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWithMethod('bKash')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        withMethod === 'bKash'
                          ? 'border-[#E2136E] bg-pink-50 text-[#E2136E] ring-2 ring-pink-400'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      বিকাশ (bKash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithMethod('Nagad')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        withMethod === 'Nagad'
                          ? 'border-[#F7941D] bg-orange-50 text-[#F7941D] ring-2 ring-orange-400'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      নগদ (Nagad)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">অ্যাকাউন্ট টাইপ</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWithType('Personal')}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold ${
                        withType === 'Personal' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      Personal (পার্সোনাল)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithType('Agent')}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold ${
                        withType === 'Agent' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      Agent (এজেন্ট)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">
                    প্রাপক নম্বর (টাকা গ্রহণের বিকাশ/নগদ নম্বর)
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={withReceiver}
                    onChange={(e) => setWithReceiver(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">টাকার পরিমাণ (৳)</label>
                  <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                    {[50, 100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithAmount(amt)}
                        className={`text-xs py-1 px-2.5 rounded-lg font-bold border shrink-0 cursor-pointer ${
                          withAmount === amt ? 'bg-[#FF1E3C] text-white border-[#FF1E3C]' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={settings.minWithdraw}
                    max={currentUser?.balance || 0}
                    value={withAmount}
                    onChange={(e) => setWithAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={`সর্বনিম্ন ৳${settings.minWithdraw}`}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    বর্তমান ব্যালেন্স: ৳{currentUser?.balance || 0}
                  </p>
                </div>

                {withFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      withFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'
                    }`}
                  >
                    {withFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />}
                    <span>{withFeedback.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withLoading}
                  className="w-full bg-[#FF1E3C] hover:bg-[#e01431] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
                >
                  {withLoading ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : '💸 টাকা উত্তোলনের রিকোয়েস্ট পাঠান'}
                </button>
              </form>
            </div>
          )}

          {/* ================= 3. TRANSACTION HISTORY ================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2 flex items-center justify-between">
                  <span>ডিপোজিট হিস্টোরি</span>
                  <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded-full">{userDeposits.length} টি</span>
                </h4>
                {userDeposits.length === 0 ? (
                  <div className="text-center py-6 bg-neutral-50 rounded-xl text-neutral-400 text-xs">
                    এখনো কোনো ডিপোজিট রিকোয়েস্ট করেননি
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userDeposits.map((dep) => (
                      <div key={dep.id} className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              +৳{dep.amount} ({dep.method})
                            </span>
                            <div className="text-[11px] font-mono text-neutral-600 mt-1">
                              TrxID: <span className="font-bold text-neutral-900">{dep.trxId}</span>
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{dep.createdAt}</div>
                          </div>
                          <div>
                            {dep.status === 'pending' && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> পেন্ডিং
                              </span>
                            )}
                            {dep.status === 'approved' && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> এপ্রুভড
                              </span>
                            )}
                            {dep.status === 'rejected' && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> বাতিল
                              </span>
                            )}
                          </div>
                        </div>
                        {dep.note && (
                          <p className="text-[10px] text-red-600 mt-1 bg-red-50 p-1 rounded">অ্যাডমিন নোট: {dep.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2 flex items-center justify-between">
                  <span>উইথড্র হিস্টোরি</span>
                  <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded-full">{userWithdraws.length} টি</span>
                </h4>
                {userWithdraws.length === 0 ? (
                  <div className="text-center py-6 bg-neutral-50 rounded-xl text-neutral-400 text-xs">
                    এখনো কোনো উইথড্র করেননি
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userWithdraws.map((w) => (
                      <div key={w.id} className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              -৳{w.amount} ({w.method} - {w.accountType})
                            </span>
                            <div className="text-[11px] text-neutral-600 mt-1 font-mono">
                              নম্বর: {w.receiverNumber}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{w.createdAt}</div>
                          </div>
                          <div>
                            {w.status === 'pending' && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> পেন্ডিং
                              </span>
                            )}
                            {w.status === 'approved' && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> সম্পন্ন
                              </span>
                            )}
                            {w.status === 'rejected' && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> বাতিল (টাকা ফেরত)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
