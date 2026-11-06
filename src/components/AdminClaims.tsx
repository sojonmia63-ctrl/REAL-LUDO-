import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MatchResultClaim, ChatMessage, Match } from '../../types';
import { rtdb } from '../../firebase';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  Search,
  MessageSquare,
  Key,
  Copy,
  Users,
  ExternalLink,
  AlertTriangle,
  UserCheck,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const AdminClaims: React.FC = () => {
  const { matchClaims, matches, chatMessages, adminApproveMatchClaim, adminRejectMatchClaim } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [viewingChatClaim, setViewingChatClaim] = useState<MatchResultClaim | null>(null);
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Loading and approval states for instant feedback
  const [processingClaimIds, setProcessingClaimIds] = useState<Record<string, boolean>>({});
  const [approvedClaimIds, setApprovedClaimIds] = useState<Record<string, boolean>>({});

  // Helper to extract 6 to 8 digit room code from chat text or match
  const extractRoomCode = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/\b\d{6,8}\b/);
    return match ? match[0] : null;
  };

  const getMatchForClaim = (matchId: number): Match | undefined => {
    return matches.find(m => m.id === matchId);
  };

  const getChatForMatch = (matchId: number): ChatMessage[] => {
    return chatMessages[matchId] || [];
  };

  const getDetectedRoomCode = (matchId: number): string | null => {
    const match = getMatchForClaim(matchId);
    if (match?.roomCode && match.roomCode.trim() !== '') {
      return match.roomCode;
    }
    const chats = getChatForMatch(matchId);
    for (const msg of chats) {
      const code = extractRoomCode(msg.text);
      if (code) return code;
    }
    return null;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filtered = matchClaims.filter(c => {
    const matchesSearch =
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userMobile.includes(searchQuery) ||
      String(c.matchId).includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = matchClaims.filter(c => c.status?.toLowerCase() === 'pending').length;

  const handleApprove = async (claim: MatchResultClaim) => {
    // 1. Log click as requested
    console.log("approve clicked", claim);

    if (!claim || processingClaimIds[claim.id]) return;

    // 2. Set processing state so button displays "Processing..." immediately
    setProcessingClaimIds(prev => ({ ...prev, [claim.id]: true }));
    setFeedbackMsg(`ম্যাচ #${claim.matchId} এর ক্লেইম অনুমোদন করা হচ্ছে...`);

    try {
      // 3. Update Firebase RTDB claims/{id}/status = "approved" and matchClaims/{id}
      await Promise.all([
        rtdb.update(`claims/${claim.id}`, {
          status: 'approved',
          reviewedAt: new Date().toLocaleString('bn-BD'),
          updatedAt: Date.now()
        }).catch(err => console.warn('claims RTDB patch warning:', err)),
        rtdb.update(`matchClaims/${claim.id}`, {
          status: 'approved',
          reviewedAt: new Date().toLocaleString('bn-BD'),
          updatedAt: Date.now()
        }).catch(err => console.warn('matchClaims RTDB patch warning:', err))
      ]);

      // 4. Update winner balance, match status, and local state
      const res = await adminApproveMatchClaim(claim.id);

      // 5. Set approved state so button displays "Approved"
      setApprovedClaimIds(prev => ({ ...prev, [claim.id]: true }));
      setFeedbackMsg(`✅ ম্যাচ #${claim.matchId} এর উইন রেজাল্ট অনুমোদিত এবং ৳${claim.winAmount} ব্যালেন্স যোগ করা হয়েছে!`);
      
      if (viewingChatClaim?.id === claim.id) {
        setViewingChatClaim(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err) {
      console.error("Error approving match claim:", err);
      setFeedbackMsg(`❌ এপ্রুভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।`);
    } finally {
      setProcessingClaimIds(prev => ({ ...prev, [claim.id]: false }));
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingClaimId) return;
    await adminRejectMatchClaim(rejectingClaimId, rejectNote || 'ভুল বা নকল স্ক্রিনশট');
    if (viewingChatClaim?.id === rejectingClaimId) {
      setViewingChatClaim(prev => prev ? { ...prev, status: 'rejected' } : null);
    }
    setRejectingClaimId(null);
    setRejectNote('');
    setFeedbackMsg('❌ ম্যাচ রেজাল্ট ক্লেইম বাতিল করা হয়েছে।');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>ম্যাচ রেজাল্ট ও প্রুফ যাচাই (Match Claims & Live Chat)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            উইন প্রুফ স্ক্রিনশটের পাশাপাশি প্লেয়ারদের মধ্যকার সম্পূর্ণ লাইভ চ্যাট ও রুম কোড আদান-প্রদান হিস্ট্রি দেখে নির্ভুলভাবে অনুমোদন করুন
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
            সব ({matchClaims.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'pending' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            পেন্ডিং ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            অনুমোদিত
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ম্যাচ নম্বর, ইউজার নাম বা মোবাইল দিয়ে সার্চ করুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ================= MATCH LIVE CHAT & ROOM CODE VIEWER MODAL ================= */}
      {viewingChatClaim && (() => {
        const match = getMatchForClaim(viewingChatClaim.matchId);
        const chats = getChatForMatch(viewingChatClaim.matchId);
        const detectedRoomCode = getDetectedRoomCode(viewingChatClaim.matchId);

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-5 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base">
                        ম্যাচ #{viewingChatClaim.matchId} — লাইভ চ্যাট ও রুম হিস্ট্রি
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        viewingChatClaim.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/60'
                          : viewingChatClaim.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60'
                          : 'bg-red-950 text-red-300 border border-red-600/60'
                      }`}>
                        {viewingChatClaim.status === 'pending' ? 'অপেক্ষমান' : viewingChatClaim.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      দুই প্লেয়ারের মধ্যে প্রেরিত প্রতিটি বার্তা, রুম কোড আদান-প্রদান এবং সময়সূচী
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingChatClaim(null)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Match Snapshot Bar */}
              <div className="bg-neutral-950/70 p-4 border-b border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
                {/* Claimer */}
                <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> উইন ক্লেইমকারী (Player 1)
                  </span>
                  <div className="font-bold text-white truncate">{viewingChatClaim.userName}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{viewingChatClaim.userMobile}</div>
                </div>

                {/* Opponent */}
                <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> প্রতিপক্ষ প্লেয়ার (Player 2)
                  </span>
                  <div className="font-bold text-white truncate">{match?.opponentName || 'প্রতিপক্ষ খেলোয়াড়'}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    ম্যাচ টাইপ: {match?.type || '২ প্লেয়ার ক্লাসিক'}
                  </div>
                </div>

                {/* Room Code & Prize */}
                <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-amber-600/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Key className="w-3 h-3" /> রুম কোড ও প্রাইজ
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                      {detectedRoomCode || 'কোড পাওয়া যায়নি'}
                    </span>
                    {detectedRoomCode && (
                      <button
                        onClick={() => copyToClipboard(detectedRoomCode)}
                        className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer font-bold"
                        title="রুম কোড কপি করুন"
                      >
                        {copiedCode === detectedRoomCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode === detectedRoomCode ? 'কপি' : 'কপি'}</span>
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    উইন প্রাইজ: <b className="text-emerald-400">৳{viewingChatClaim.winAmount}</b> (এন্ট্রি: ৳{match?.entry || '-'})
                  </div>
                </div>
              </div>

              {/* Chat Message Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-900/50">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-2 border-b border-neutral-800">
                  <span className="flex items-center gap-1 font-bold text-neutral-300">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>মোট বার্তা সংখ্যা: {chats.length} টি</span>
                  </span>
                  <span>রিয়েল-টাইম লাইভ চ্যাট লগ</span>
                </div>

                {chats.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-800/80 text-neutral-500 mx-auto flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-neutral-400 font-bold">
                      এই ম্যাচের জন্য কোনো লাইভ চ্যাট মেসেজ রেকর্ড পাওয়া যায়নি।
                    </p>
                    <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                      প্লেয়াররা হয়তো চ্যাটে বার্তা পাঠাননি বা সরাসরি লুডো কিং অ্যাপে প্রবেশ করে খেলেছেন।
                    </p>
                  </div>
                ) : (
                  chats.map((msg, index) => {
                    const isClaimer = msg.senderId ? msg.senderId === viewingChatClaim.userId : msg.sender === 'me';
                    const codeInMsg = extractRoomCode(msg.text);

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col max-w-[85%] rounded-2xl p-3 shadow-md ${
                          isClaimer
                            ? 'ml-auto bg-emerald-950/80 border border-emerald-600/40 text-emerald-100 rounded-tr-xs'
                            : 'mr-auto bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-tl-xs'
                        }`}
                      >
                        {/* Sender Badge */}
                        <div className="flex items-center justify-between gap-3 text-[10px] mb-1 pb-1 border-b border-white/10">
                          <span className={`font-bold flex items-center gap-1 ${isClaimer ? 'text-emerald-300' : 'text-sky-300'}`}>
                            {isClaimer ? <Trophy className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                            <span>{msg.senderName || (isClaimer ? viewingChatClaim.userName : 'প্রতিপক্ষ')}</span>
                            <span className="opacity-75 font-normal">({isClaimer ? 'উইন ক্লেইমার' : 'প্রতিপক্ষ'})</span>
                          </span>
                          <span className="text-neutral-400 font-mono text-[9px]">{msg.time}</span>
                        </div>

                        {/* Message Text */}
                        <div className="text-xs leading-relaxed break-words font-sans">
                          {msg.text}
                        </div>

                        {/* Room Code Highlight Badge if detected in this message */}
                        {codeInMsg && (
                          <div className="mt-2 pt-1.5 border-t border-amber-500/20 flex items-center justify-between bg-amber-950/60 p-1.5 rounded-lg border border-amber-500/40 text-amber-200 text-[11px]">
                            <span className="flex items-center gap-1 font-bold">
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                              <span>রুম কোড শনাক্ত: <b className="font-mono text-amber-300 tracking-wider">{codeInMsg}</b></span>
                            </span>
                            <button
                              onClick={() => copyToClipboard(codeInMsg)}
                              className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-amber-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer font-bold"
                            >
                              {copiedCode === codeInMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>কপি</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Screenshot & Quick Action Bar */}
              <div className="bg-neutral-950 p-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {viewingChatClaim.screenshotUrl ? (
                    <button
                      onClick={() => setViewingScreenshot(viewingChatClaim.screenshotUrl)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <Eye className="w-4 h-4 text-sky-400" />
                      <span>স্ক্রিনশট প্রুফ দেখুন</span>
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-500 italic">কোনো স্ক্রিনশট নেই</span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {viewingChatClaim.status?.toLowerCase() === 'pending' && !approvedClaimIds[viewingChatClaim.id] ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(viewingChatClaim)}
                        disabled={processingClaimIds[viewingChatClaim.id]}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer ${
                          processingClaimIds[viewingChatClaim.id]
                            ? 'bg-amber-600 text-white cursor-wait opacity-90'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {processingClaimIds[viewingChatClaim.id] ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>অনুমোদন করুন (Approve ৳{viewingChatClaim.winAmount})</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingClaimId(viewingChatClaim.id)}
                        disabled={processingClaimIds[viewingChatClaim.id]}
                        className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        <span>বাতিল</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-300 font-bold bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{approvedClaimIds[viewingChatClaim.id] || viewingChatClaim.status === 'approved' ? 'Approved (৳' + viewingChatClaim.winAmount + ' ওয়ালেটে যুক্ত)' : 'বাতিলকৃত'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewingChatClaim(null)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Screenshot Zoom Modal */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 max-w-lg w-full space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-700">
              <h3 className="font-bold text-white text-sm">খেলার স্ক্রিনশট প্রুফ</h3>
              <button
                onClick={() => setViewingScreenshot(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-black flex items-center justify-center">
              <img src={viewingScreenshot} alt="Match Proof Screenshot" className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
            <button
              onClick={() => setViewingScreenshot(null)}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingClaimId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-white text-sm">রেজাল্ট বাতিলের কারণ</h3>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="যেমন: ভুল স্ক্রিনশট / অপর পক্ষ জিতেছে"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectingClaimId(null)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold"
              >
                নিশ্চিত রিজেক্ট
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
                <th className="px-4 py-3">ম্যাচ আইডি</th>
                <th className="px-4 py-3">ইউজার ও ফোন</th>
                <th className="px-4 py-3">ক্লেইম (ফলাফল)</th>
                <th className="px-4 py-3">প্রাইজ / উইন</th>
                <th className="px-4 py-3">প্রমাণ ও চ্যাট হিস্ট্রি</th>
                <th className="px-4 py-3">রুম কোড</th>
                <th className="px-4 py-3">সাবমিট তারিখ</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/60 text-neutral-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-neutral-400">
                    কোনো ম্যাচ রেজাল্ট ক্লেইম পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => {
                  const matchChats = getChatForMatch(claim.matchId);
                  const roomCode = getDetectedRoomCode(claim.matchId);

                  return (
                    <tr key={claim.id} className="hover:bg-neutral-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        ম্যাচ #{claim.matchId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{claim.userName}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{claim.userMobile}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                          claim.claim === 'win'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                        }`}>
                          {claim.claim === 'win' ? '🏆 জয়ী (WIN)' : '❌ পরাজিত (LOSE)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-amber-300 text-sm block">৳{claim.winAmount}</span>
                        <span className="text-[10px] text-neutral-400">মোট: ৳{claim.prize}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Chat History Viewer Button */}
                          <button
                            onClick={() => setViewingChatClaim(claim)}
                            className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/80 border border-amber-600/50 px-2 py-1 rounded-lg cursor-pointer transition-all hover:bg-amber-900 active:scale-95"
                            title="প্লেয়ারদের মধ্যকার সম্পূর্ণ লাইভ চ্যাট ও কোড হিস্ট্রি দেখুন"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>চ্যাট হিস্ট্রি</span>
                            <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1 rounded-full font-mono">
                              {matchChats.length}
                            </span>
                          </button>

                          {/* Screenshot Proof Button */}
                          {claim.screenshotUrl ? (
                            <button
                              onClick={() => setViewingScreenshot(claim.screenshotUrl)}
                              className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-950/80 border border-sky-700/60 px-2 py-1 rounded-lg cursor-pointer transition-all hover:bg-sky-900"
                              title="ইউজারের আপলোড করা স্ক্রিনশট প্রুফ দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ছবি</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-500">ছবি নেই</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {roomCode ? (
                          <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-700/80 px-2 py-0.5 rounded-md w-fit">
                            <Key className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300 font-bold text-[11px]">{roomCode}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-[11px]">
                        {claim.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        {claim.status === 'pending' && (
                          <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-600/60 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> অপেক্ষমান
                          </span>
                        )}
                        {claim.status === 'approved' && (
                          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-600/60 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                          </span>
                        )}
                        {claim.status === 'rejected' && (
                          <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-600/60 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> বাতিল
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {claim.status?.toLowerCase() === 'pending' && !approvedClaimIds[claim.id] ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(claim)}
                              disabled={processingClaimIds[claim.id]}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer ${
                                processingClaimIds[claim.id]
                                  ? 'bg-amber-600 text-white cursor-wait opacity-90'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                              title="অনুমোদন করুন ও উইন প্রাইজ দিন"
                            >
                              {processingClaimIds[claim.id] ? (
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
                              onClick={() => setRejectingClaimId(claim.id)}
                              disabled={processingClaimIds[claim.id]}
                              className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                              title="বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{approvedClaimIds[claim.id] || claim.status === 'approved' ? 'Approved' : 'বাতিলকৃত'}</span>
                          </span>
                        )}
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
