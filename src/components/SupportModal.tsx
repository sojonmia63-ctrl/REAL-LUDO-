import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  MessageSquare,
  PhoneCall,
  Send,
  ShieldAlert,
  Clock,
  HelpCircle,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Award
} from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
  const { settings, currentUser } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const whatsappClean = (settings.supportWhatsapp || '01610336066').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/880${whatsappClean.startsWith('0') ? whatsappClean.slice(1) : whatsappClean}`;
  const telegramHandle = (settings.supportTelegram || '@realludo_official').replace('@', '');
  const telegramUrl = `https://t.me/${telegramHandle}`;

  // Referral code & link (Point 7 & 8)
  const userReferCode = currentUser?.referCode || currentUser?.id || 'RL-100001';
  const baseUrl = settings.referralLink && settings.referralLink.trim()
    ? settings.referralLink.trim().replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : 'https://realludo.app');
  const userReferralLink = `${baseUrl}/?ref=${userReferCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🎲 রিয়েল লুডু খেলে প্রতিদিন টাকা ইনকাম করুন! আমার রেফারেল কোড: ${userReferCode} ব্যবহার করে একাউন্ট খুলে ইনস্ট্যান্ট বোনাস নিন! জয়েন লিংক: ${userReferralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

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
          <div className="font-bold text-base">গ্রাহক সেবা ও রেফারাল</div>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Support Head */}
          <div className="text-center py-1">
            <div className="w-14 h-14 bg-red-100 text-[#FF1E3C] rounded-full flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
              🎧
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">২৪/৭ কাস্টমার সাপোর্ট</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              ডিপোজিট, উইথড্র বা লুডু ম্যাচ সংক্রান্ত যেকোনো সমস্যায় সাথে সাথে যোগাযোগ করুন
            </p>
          </div>

          {/* Contact options */}
          <div className="space-y-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-emerald-950">হোয়াটসঅ্যাপ সাপোর্ট (WhatsApp)</h4>
                  <p className="text-xs text-emerald-800 font-mono mt-0.5 font-bold">{settings.supportWhatsapp || '01610336066'}</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                মেসেজ দিন
              </span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 bg-sky-50 border-2 border-sky-300 rounded-2xl hover:bg-sky-100 transition-all shadow-sm group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-sky-950">টেলিগ্রাম সাপোর্ট (Telegram)</h4>
                  <p className="text-xs text-sky-800 font-mono mt-0.5 font-bold">{settings.supportTelegram || '@realludo_official'}</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-sky-600 text-white px-3 py-1 rounded-full group-hover:scale-105 transition-transform">
                যোগদান
              </span>
            </a>
          </div>

          {/* ================= REFERRAL SYSTEM (Point 7 & 8) ================= */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-neutral-900">রেফার করুন ও আয় করুন (Refer & Earn)</h4>
                  <p className="text-[11px] text-amber-800 font-semibold">
                    প্রতি সফল রেফারে বোনাস: <b className="text-red-600">৳{settings.referralBonus || 10}</b>
                  </p>
                </div>
              </div>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/80 border border-amber-200 rounded-xl p-2">
                <span className="text-[10px] text-neutral-500 font-bold block">মোট রেফারেল</span>
                <span className="text-base font-black text-neutral-800">
                  {currentUser?.referralsCount || 0} জন
                </span>
              </div>
              <div className="bg-white/80 border border-amber-200 rounded-xl p-2">
                <span className="text-[10px] text-neutral-500 font-bold block">রেফারেল থেকে আয়</span>
                <span className="text-base font-black text-emerald-600">
                  ৳{currentUser?.referralEarnings || 0}
                </span>
              </div>
            </div>

            {/* Refer Code Box */}
            <div className="bg-white border border-neutral-200 rounded-xl p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-neutral-500 font-bold">আপনার রেফারেল কোড:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userReferCode, 'code')}
                  className="text-xs font-bold text-[#FF1E3C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
              <div className="font-mono text-base font-black tracking-widest text-neutral-900 text-center bg-amber-50/80 py-1.5 rounded-lg border border-amber-200">
                {userReferCode}
              </div>
            </div>

            {/* Refer Link Box */}
            <div className="bg-white border border-neutral-200 rounded-xl p-2.5 space-y-1.5">
              <span className="text-[11px] text-neutral-500 font-bold block">আপনার শেয়ারিং লিংক:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={userReferralLink}
                  className="flex-1 bg-neutral-100 px-2.5 py-1.5 rounded-lg text-xs font-mono text-neutral-600 truncate border border-neutral-200 select-all"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(userReferralLink, 'link')}
                  className="bg-neutral-800 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                </button>
              </div>

              {/* Share on WhatsApp button */}
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="w-full bg-[#00A651] hover:bg-[#008f45] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপে বন্ধুদের শেয়ার করুন</span>
              </button>
            </div>

            {/* Rules Text (Dynamic from DB) */}
            <p className="text-[10px] text-neutral-600 leading-relaxed bg-white/60 p-2 rounded-lg border border-amber-200">
              📌 {settings.referralRules || 'আপনার রেফারেল কোড বা লিংক শেয়ার করে বন্ধুদের যুক্ত করুন। বন্ধু সফলভাবে যুক্ত হলে আপনি পাবেন ৳১০ বোনাস!'}
            </p>
          </div>

          {/* Quick FAQ / Guidelines */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3.5 text-xs space-y-2">
            <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-[#FF1E3C]" />
              <span>জরুরি তথ্যসমূহ</span>
            </h4>
            <div className="space-y-1.5 text-neutral-600 text-[11px] leading-relaxed">
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <span>ডিপোজিট সাধারণত ৫ থেকে ১৫ মিনিটের মধ্যে অ্যাডমিন কর্তৃক অ্যাপ্রুভ হয়।</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>লুডু খেলা শেষে ফলাফল ও স্ক্রিনশট সাবমিট করলে অ্যাডমিন যাচাই করে প্রাইজ যুক্ত করবেন।</span>
              </div>
              <div className="flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <span>ম্যাচে প্রতিপক্ষের সাথে রুমে কথা বলার জন্য ইন-গেম লাইভ চ্যাট ব্যবহার করতে পারবেন।</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
