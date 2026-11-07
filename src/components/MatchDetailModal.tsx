import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Match } from '../types';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Crown,
  Copy,
  Check,
  Send,
  Upload,
  Trophy,
  CheckCircle2,
  Gamepad2,
  ExternalLink,
  Clock,
  Lock,
  AlertCircle
} from 'lucide-react';

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const { currentUser, submitMatchResult, chatMessages, sendChatMessage, matchClaims } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(match.screenshotUrl || null);
  const [resultClaim, setResultClaim] = useState<'win' | 'lose'>('win');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentChat = chatMessages[match.id] || [];

  // Check if current user already submitted a claim for this match
  const existingClaim = matchClaims.find(
    c => c.matchId === match.id && c.userId === currentUser?.id
  );
  const isLocked = Boolean(existingClaim || submitted || match.userClaim || match.status === 'done');
  const isApproved = Boolean(match.isApproved || existingClaim?.status === 'approved');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat]);

  const copyRoomCode = () => {
    if (!match.roomCode) return;
    navigator.clipboard.writeText(match.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || !currentUser) return;
    sendChatMessage(match.id, text.trim(), currentUser.name);
    setChatInput('');
  };

  const handleScreenshotChange = (file: File | undefined) => {
    if (!file || isLocked) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitResult = async () => {
    if (isLocked || isSubmitting) return;
    setIsSubmitting(true);
    const res = await submitMatchResult(match.id, resultClaim, screenshot || undefined);
    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      if (resultClaim === 'win') {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    }
  };

  const handleOpenLudoKing = () => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'market://details?id=com.ludo.king';
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.ludo.king', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white text-neutral-900 w-full max-w-md h-[94vh] sm:h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-[#FF1E3C] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/90 hover:text-white font-semibold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> পিছনে
          </button>
          <div className="font-bold text-base flex items-center gap-1.5">
            <Gamepad2 className="w-5 h-5 text-amber-300" />
            <span>ম্যাচ রুম #{match.id}</span>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Scrollable match room body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Match Info Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-4 shadow text-center relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1">
              {match.type} • {match.status === 'up' ? 'UPCOMING' : match.status === 'on' ? 'ONGOING' : 'COMPLETED'}
            </div>
            <div className="flex items-center justify-center gap-6 my-2">
              <div>
                <span className="text-[10px] text-neutral-400 block">মোট প্রাইজ</span>
                <span className="text-xl font-black text-white">৳{match.prize}</span>
              </div>
              <div className="h-8 w-px bg-neutral-700"></div>
              <div>
                <span className="text-[10px] text-amber-300 block font-bold">বিজয়ী পাবে</span>
                <span className="text-2xl font-black text-amber-300">৳{match.win}</span>
              </div>
              <div className="h-8 w-px bg-neutral-700"></div>
              <div>
                <span className="text-[10px] text-neutral-400 block">এন্ট্রি ফি</span>
                <span className="text-xl font-black text-emerald-400">৳{match.entry}</span>
              </div>
            </div>

            {/* Room code display */}
            <div className="mt-3 bg-neutral-800/80 border border-neutral-700 rounded-xl p-2.5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-neutral-400 block">Ludo King Room Code:</span>
                <span className="text-lg font-black tracking-widest font-mono text-amber-300">
                  {match.roomCode || 'অপেক্ষা করুন...'}
                </span>
              </div>
              {match.roomCode && (
                <button
                  onClick={copyRoomCode}
                  className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Open Ludo King Button (only if not completed/approved) */}
          {!isApproved && (
            <button
              onClick={handleOpenLudoKing}
              className="w-full bg-[#00A651] hover:bg-[#008f45] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-5 h-5 text-amber-300" />
              <span>👑 LUDO KING ওপেন করো</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </button>
          )}

          {/* In-Game Live Real Player Chat Box (Bot Auto-reply permanently disabled) */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Chat header */}
            <div className="bg-[#FF1E3C] text-white px-3.5 py-2.5 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span>💬 {match.opponentName || 'প্লেয়ার লাইভ চ্যাট'}</span>
              </div>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                ● লাইভ প্লেয়ার
              </span>
            </div>

            {/* Chat message list */}
            <div className="h-44 overflow-y-auto p-3 bg-red-50/20 space-y-2 text-xs">
              {currentChat.length === 0 ? (
                <div className="text-center text-neutral-400 text-xs py-8">
                  রিয়েল প্লেয়ারদের লাইভ চ্যাট। নিচে মেসেজ লিখে পাঠান।
                </div>
              ) : (
                currentChat.map((msg) => {
                  const isMe = msg.senderId ? msg.senderId === currentUser?.id : msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs shadow-2xs ${
                        isMe
                          ? 'bg-[#DCF8C6] text-neutral-900 ml-auto rounded-tr-xs'
                          : 'bg-white text-neutral-900 border border-neutral-200 mr-auto rounded-tl-xs'
                      }`}
                    >
                      <div className="font-semibold text-[10px] text-neutral-500 mb-0.5">
                        {isMe ? 'আমি' : msg.senderName || 'প্রতিপক্ষ'}
                      </div>
                      <div className="break-words">{msg.text}</div>
                      <div className="text-[9px] text-neutral-400 text-right mt-0.5">{msg.time}</div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="p-2 bg-neutral-50 border-t border-neutral-200 flex gap-1.5 overflow-x-auto text-xs">
              {[
                'Room Code dao 🙏',
                'Room বানিয়েছি, কোড দিচ্ছি...',
                'Join koro',
                'Ready?'
              ].map((quickText) => (
                <button
                  key={quickText}
                  type="button"
                  onClick={() => handleSendMessage(quickText)}
                  className="bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  {quickText}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-2 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 px-3 py-2 border border-neutral-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#FF1E3C]"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="bg-[#FF1E3C] hover:bg-[#e01431] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Result Submission & Lock Section (Point 3) */}
          <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50 space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>খেলার ফলাফল ও প্রমাণ</span>
            </h4>

            {isLocked ? (
              isApproved ? (
                /* 1. Admin Approved state */
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-center text-xs text-emerald-900 space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-black text-sm text-emerald-900">ম্যাচ সম্পন্ন হয়েছে (Completed)</p>
                  <p className="text-[11px] text-emerald-700">
                    অ্যাডমিন প্যানেল থেকে ম্যাচ ফলাফল যাচাই ও অনুমোদন সম্পন্ন হয়েছে।
                  </p>
                </div>
              ) : (
                /* 2. Permanent Lock Status: ফলাফল সাবমিট হয়েছে (পেন্ডিং রিভিউ) */
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-amber-700">
                    <Lock className="w-5 h-5" />
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <p className="font-black text-sm text-amber-900">
                    ফলাফল সাবমিট হয়েছে (পেন্ডিং রিভিউ)
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    আপনার ফলাফল এবং স্ক্রিনশট লক করা হয়েছে। অ্যাডমিন প্যানেলে এটি জমা রয়েছে এবং যাচাই শেষে ব্যালেন্স স্বয়ংক্রিয়ভাবে আপডেট হবে।
                  </p>
                  {(screenshot || match.screenshotUrl || existingClaim?.screenshotUrl) && (
                    <div className="mt-2 pt-2 border-t border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-900 block mb-1">জমা দেওয়া স্ক্রিনশট:</span>
                      <img
                        src={screenshot || match.screenshotUrl || existingClaim?.screenshotUrl}
                        alt="Submitted Result"
                        className="max-h-36 mx-auto rounded-lg border border-amber-300 shadow-xs object-cover"
                      />
                    </div>
                  )}
                </div>
              )
            ) : (
              /* 3. First time result submission */
              <div className="space-y-3">
                {/* Upload screenshot */}
                <div className="border-2 border-dashed border-[#FF1E3C]/40 bg-pink-50/40 rounded-xl p-3 text-center">
                  {screenshot ? (
                    <div className="relative">
                      <img src={screenshot} alt="Match Proof" className="max-h-40 mx-auto rounded-lg border shadow-xs" />
                      <label
                        htmlFor="result-screenshot-input"
                        className="text-[11px] text-red-600 hover:underline block mt-1 cursor-pointer font-semibold"
                      >
                        অন্য ছবি দিন
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="result-screenshot-input"
                      className="cursor-pointer block py-2 text-neutral-600 hover:text-neutral-900"
                    >
                      <Upload className="w-6 h-6 text-[#FF1E3C] mx-auto mb-1" />
                      <span className="text-xs font-bold block">📸 খেলার স্ক্রিনশট আপলোড করুন</span>
                      <span className="text-[10px] text-neutral-500">Ludo King এর Victory স্ক্রিনের ছবি দিন</span>
                    </label>
                  )}
                  <input
                    id="result-screenshot-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleScreenshotChange(e.target.files?.[0])}
                  />
                </div>

                {/* Result selection */}
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">আপনার খেলার ফলাফল</label>
                  <select
                    value={resultClaim}
                    onChange={(e) => setResultClaim(e.target.value as 'win' | 'lose')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-[#FF1E3C]"
                  >
                    <option value="win">✅ আমি জিতেছি (I Won)</option>
                    <option value="lose">❌ আমি হেরেছি (I Lost)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitResult}
                  disabled={isSubmitting}
                  className="w-full bg-[#FF1E3C] hover:bg-[#e01431] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সাবমিট হচ্ছে...' : '📤 RESULT SUBMIT'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
