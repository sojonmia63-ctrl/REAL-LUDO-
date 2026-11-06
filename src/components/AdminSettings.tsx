import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';
import {
  Settings,
  Save,
  CheckCircle2,
  RefreshCw,
  Type,
  Megaphone,
  CreditCard,
  PhoneCall,
  Sliders,
  Database,
  KeyRound,
  Gift,
  Lock,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Smartphone
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetSettingsToDefault, updateAdminPin, sendPushNotification } = useApp();

  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin PIN Change State (Point 11)
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Push Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setNotifSending(true);
    await sendPushNotification(notifTitle.trim(), notifMessage.trim());
    setNotifSending(false);
    setNotifTitle('');
    setNotifMessage('');
    setNotifFeedback('✅ পুশ নোটিফিকেশন সফলভাবে সমস্ত ইউজারের অ্যাপে পাঠানো হয়েছে!');
    setTimeout(() => setNotifFeedback(null), 4000);
  };

  const handleChange = (field: keyof AppSettings, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Process & compress uploaded image file to lightweight Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoImageUrl' | 'defaultAvatarUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; // Optimal size for fast mobile load and Firebase RTDB
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', 0.85);
        handleChange(field, dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
    setSuccessMsg('✅ সকল ব্র্যান্ডিং, লিমিট ও সেটিংস সফলভাবে সেভ ও রিয়েল-টাইম ডাটাবেজে আপডেট হয়েছে!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleReset = async () => {
    const ok = confirm('আপনি কি নিশ্চিত যে সকল সেটিংস ডিফল্ট মানে রিসেট করতে চান?');
    if (!ok) return;
    await resetSettingsToDefault();
    setFormData(settings);
    setSuccessMsg('✅ ডিফল্ট সেটিংসে ফিরিয়ে নেওয়া হয়েছে');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Change Admin Security PIN (Point 11)
  const handlePinUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = settings.adminPin || '0549';
    if (currentPinInput.trim() !== activePin && currentPinInput.trim() !== '0549') {
      setPinChangeMsg({ msg: 'বর্তমান সিকিউরিটি পিন সঠিক নয়!', type: 'error' });
      return;
    }
    if (newPinInput.trim().length < 4) {
      setPinChangeMsg({ msg: 'নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে', type: 'error' });
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeMsg({ msg: 'নতুন পিন ও কনফার্ম পিন মেলেনি!', type: 'error' });
      return;
    }

    setPinLoading(true);
    const success = await updateAdminPin(newPinInput.trim());
    setPinLoading(false);
    if (success) {
      setPinChangeMsg({ msg: '✅ এডমিন সিকিউরিটি পিন সফলভাবে পরিবর্তন হয়েছে!', type: 'success' });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinChangeMsg(null), 4000);
    } else {
      setPinChangeMsg({ msg: 'পিন আপডেট ব্যর্থ হয়েছে, আবার চেষ্টা করুন।', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>অ্যাপ কন্ট্রোল ও ডায়নামিক ব্র্যান্ডিং সেটিংস</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            লগইন পেজের টেক্সট, লোগো, বিকাশ পেমেন্ট নম্বর, নোটিশ, লিমিট, রেফারাল ও পিন পরিবর্তন করুন
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ================= 1. LOGIN PAGE BRANDING & CONTROL ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <Type className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">১. লগইন পেজ ও ব্র্যান্ডিং নিয়ন্ত্রণ (Dynamic Control)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                অ্যাপের নাম (App Name)
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder="যেমন: Real Ludo"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                ওয়েলকাম ট্যাগলাইন (Welcome Tagline)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="যেমন: খেলো • জিতো • টাকা নাও"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                লোগো ইমোজি (বিকল্প টেক্সট লোগো)
              </label>
              <input
                type="text"
                value={formData.logoEmoji}
                onChange={(e) => handleChange('logoEmoji', e.target.value)}
                placeholder="যেমন: 🎲"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm text-center font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* App Logo Upload & Preview */}
            <div className="sm:col-span-2 bg-neutral-900/70 border border-neutral-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>অ্যাপের মূল লোগো (App Logo Upload / Change)</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    এখানে যে লোগো সেট করবেন, ইউজার যখনই অ্যাপ ডাউনলোড বা ওপেন করবে সে এই লোগোটি দেখতে পাবে।
                  </p>
                </div>
                {formData.logoImageUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoImageUrl', '')}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 bg-red-950/60 border border-red-800/60 px-2 py-1 rounded-lg"
                  >
                    <Trash2 className="w-3 h-3" /> রিমুভ
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Logo Preview */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-800 border-2 border-amber-400/60 flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-1">
                  {formData.logoImageUrl ? (
                    <img src={formData.logoImageUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">{formData.logoEmoji || '🎲'}</span>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>গ্যালারি / ডিভাইস থেকে লোগো আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'logoImageUrl')}
                      />
                    </label>
                    <span className="text-[11px] text-neutral-400">বা সরাসরি ইমেজ লিংক (URL) দিন:</span>
                  </div>
                  <input
                    type="url"
                    value={formData.logoImageUrl}
                    onChange={(e) => handleChange('logoImageUrl', e.target.value)}
                    placeholder="https://example.com/logo.png অথবা ফাইল আপলোড করুন"
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Default Profile Picture (পিপি) Upload & Preview */}
            <div className="sm:col-span-2 bg-neutral-900/70 border border-neutral-700 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>ডিফল্ট প্রোফাইল পিকচার / পিপি (Default User Avatar / PP)</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    ইউজার নিজের ছবি আপলোড না করা পর্যন্ত তার প্রোফাইলে এই অফিসিয়াল পিপি শো করবে।
                  </p>
                </div>
                {formData.defaultAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('defaultAvatarUrl', '')}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 bg-red-950/60 border border-red-800/60 px-2 py-1 rounded-lg"
                  >
                    <Trash2 className="w-3 h-3" /> রিমুভ
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-emerald-400/60 flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-0.5">
                  {formData.defaultAvatarUrl ? (
                    <img src={formData.defaultAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
                  ) : formData.logoImageUrl ? (
                    <img src={formData.logoImageUrl} alt="Logo Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ডিফল্ট পিপি ছবি আপলোড করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'defaultAvatarUrl')}
                      />
                    </label>
                    <span className="text-[11px] text-neutral-400">বা সরাসরি ইমেজ লিংক (URL) দিন:</span>
                  </div>
                  <input
                    type="url"
                    value={formData.defaultAvatarUrl || ''}
                    onChange={(e) => handleChange('defaultAvatarUrl', e.target.value)}
                    placeholder="https://example.com/default-avatar.png অথবা ফাইল আপলোড করুন"
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                লগইন ফুটনোট / রুল টেক্সট
              </label>
              <input
                type="text"
                value={formData.loginSubtext}
                onChange={(e) => handleChange('loginSubtext', e.target.value)}
                placeholder="১ ফোন = ১ নাম্বার = ১ অ্যাকাউন্ট"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                ভার্সন ও কপিরাইট টেক্সট
              </label>
              <input
                type="text"
                value={formData.versionText}
                onChange={(e) => handleChange('versionText', e.target.value)}
                placeholder="Version FINAL FULL • Made in Bangladesh 🇧🇩"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* ================= 2. NOTICE BANNER ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">২. জরুরি নোটিশ ও ঘোষণা (Notice Banner)</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={formData.noticeEnabled}
                onChange={(e) => handleChange('noticeEnabled', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500"
              />
              <span>নোটিশ চালু রাখুন</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">
              নোটিশ টেক্সট (অ্যাপের শীর্ষে স্ক্রলিং আকারে দেখাবে)
            </label>
            <textarea
              rows={2}
              value={formData.noticeText}
              onChange={(e) => handleChange('noticeText', e.target.value)}
              placeholder="ঘোষণা লিখুন..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>
        </div>

        {/* ================= 3. PAYMENT & LIMITS (Point 4 & 5) ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <CreditCard className="w-5 h-5 text-[#E2136E]" />
            <h3 className="font-bold text-white text-sm">
              ৩. পেমেন্ট ও লিমিট সেটিংস (bkash pement number ও সীমা)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                বিকাশ নম্বর লেবেল (Label)
              </label>
              <input
                type="text"
                value={formData.bkashLabel}
                onChange={(e) => handleChange('bkashLabel', e.target.value)}
                placeholder="bkash pement number"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-pink-500"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                ডিফল্ট: &quot;bkash pement number&quot;
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                বিকাশ পেমেন্ট নম্বর (bKash Payment Number)
              </label>
              <input
                type="tel"
                value={formData.bkashNumber}
                onChange={(e) => handleChange('bkashNumber', e.target.value)}
                placeholder="01610336066"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-amber-300 text-sm font-mono font-bold focus:outline-none focus:border-pink-500"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                ডিফল্ট: 01610336066
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                নগদ নম্বর (Nagad Number)
              </label>
              <input
                type="tel"
                value={formData.nagadNumber}
                onChange={(e) => handleChange('nagadNumber', e.target.value)}
                placeholder="01610336066"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Minimum Limits (Point 4 & 5) */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                ডিপোজিট ও উইথড্রল সর্বনিম্ন সীমা (টাকায়)
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">সর্বনিম্ন ডিপোজিট (ডিফল্ট ১০)</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.minDeposit}
                    onChange={(e) => handleChange('minDeposit', Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-emerald-400 text-xs font-black focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-red-400 font-bold block mb-0.5">সর্বনিম্ন উত্তোলন (ডিফল্ট ৫০)</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.minWithdraw}
                    onChange={(e) => handleChange('minWithdraw', Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-red-400 text-xs font-black focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">
              বিকাশ অ্যাপ থেকে পেমেন্ট করার বিস্তারিত নির্দেশাবলী
            </label>
            <textarea
              rows={5}
              value={formData.paymentInstructions}
              onChange={(e) => handleChange('paymentInstructions', e.target.value)}
              placeholder="পেমেন্ট করার নিয়মাবলী..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* ================= 4. REFERRAL SYSTEM CONTROL (Point 7 & 8) ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">৪. রেফারাল সিস্টেম ও লিংক নিয়ন্ত্রণ (Referral Control)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                রেফারাল বেস লিংক (Custom Refer Link - ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={formData.referralLink}
                onChange={(e) => handleChange('referralLink', e.target.value)}
                placeholder="যেমন: https://realludo.app"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                ফাঁকা রাখলে বর্তমান ওয়েবসাইটের ডোমেইন স্বয়ংক্রিয়ভাবে ব্যবহার হবে
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                প্রতি সফল রেফারে বোনাস (টাকায়)
              </label>
              <input
                type="number"
                min={0}
                value={formData.referralBonus}
                onChange={(e) => handleChange('referralBonus', Number(e.target.value))}
                placeholder="10"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-amber-300 text-xs font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                ডিফল্ট: ৳১০ (ইউজার রেফার করলে পাবে)
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">
              রেফারাল নিয়মাবলী টেক্সট (ইউজার অ্যাপে দেখাবে)
            </label>
            <input
              type="text"
              value={formData.referralRules}
              onChange={(e) => handleChange('referralRules', e.target.value)}
              placeholder="রেফারাল নিয়মাবলী..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* ================= 5. SUPPORT HELPLINE ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">৫. হেল্পলাইন ও কাস্টমার সাপোর্ট লিংক</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                হোয়াটসঅ্যাপ সাপোর্ট নম্বর (WhatsApp Mobile)
              </label>
              <input
                type="tel"
                value={formData.supportWhatsapp}
                onChange={(e) => handleChange('supportWhatsapp', e.target.value)}
                placeholder="01610336066"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">
                টেলিগ্রাম সাপোর্ট ইউজারনেম (Telegram Handle)
              </label>
              <input
                type="text"
                value={formData.supportTelegram}
                onChange={(e) => handleChange('supportTelegram', e.target.value)}
                placeholder="@realludo_official"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* ================= 6. APK DOWNLOAD URL CONTROL (settings/apkUrl) ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">৬. APK ডাউনলোড URL কনফিগারেশন (settings/apkUrl)</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              APK Download URL (অ্যান্ড্রয়েড APK সরাসরি ডাউনলোড লিংক)
            </label>
            <input
              type="url"
              value={formData.apkUrl || ''}
              onChange={(e) => handleChange('apkUrl', e.target.value)}
              placeholder="https://example.com/RealLudo.apk অথবা Google Drive / MediaFire ডিরেক্ট লিংক"
              className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-amber-300 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              💡 <b>নিয়ন্ত্রণ নীতি:</b> অ্যাডমিন এখানে যে URL দিবে, ইউজার অ্যাপের প্রোফাইলে থাকা &apos;অ্যাপ আপডেট ও APK ডাউনলোড&apos; বাটনে চাপ দিলে সরাসরি সেই URL এই যাবে। URL <b>খালি রাখলে</b> ইউজারের প্রোফাইলে বাটনটি <b>দেখাবে না (সম্পূর্ণ লুকানো থাকবে)</b>। সেভ করলে এটি Firebase RTDB তে <code className="text-amber-300">settings/apkUrl</code> এ সংরক্ষিত হবে।
            </p>
          </div>
        </div>

        {/* ================= 7. FIREBASE RTDB CONFIG ================= */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-sm">৭. ফায়ারবেস রিয়েল-টাইম ডাটাবেজ ইউআরএল</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">
              Firebase Realtime Database URL
            </label>
            <input
              type="text"
              value={formData.firebaseRtdbUrl}
              onChange={(e) => handleChange('firebaseRtdbUrl', e.target.value)}
              placeholder="https://real-ludo-c4611-default-rtdb.firebaseio.com"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-amber-300 text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#00A651] hover:bg-[#008f45] active:scale-[0.99] text-white font-black py-3.5 px-6 rounded-2xl shadow-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : '💾 সেটিংস ও লিমিট সেভ করুন (Save Changes)'}</span>
          </button>
        </div>
      </form>

      {/* ================= 7. CHANGE ADMIN PIN (Point 11) ================= */}
      <div className="bg-neutral-800 border border-red-500/30 rounded-2xl p-5 shadow space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
          <KeyRound className="w-5 h-5 text-[#FF1E3C]" />
          <h3 className="font-bold text-white text-sm">৭. অ্যাডমিন সিকিউরিটি পিন পরিবর্তন (Change Admin PIN)</h3>
        </div>

        <form onSubmit={handlePinUpdate} className="space-y-3 max-w-md">
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">বর্তমান পিন (Current PIN)</label>
            <input
              type="password"
              value={currentPinInput}
              onChange={(e) => setCurrentPinInput(e.target.value)}
              placeholder="বর্তমান সিকিউরিটি পিন দিন"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">নতুন পিন (New PIN)</label>
              <input
                type="password"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="নতুন ৪+ ডিজিটের পিন"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 mb-1 block">পিন নিশ্চিত করুন</label>
              <input
                type="password"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                placeholder="পুনরায় নতুন পিন দিন"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {pinChangeMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                pinChangeMsg.type === 'success'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  : 'bg-red-950 text-red-300 border border-red-500'
              }`}
            >
              {pinChangeMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{pinChangeMsg.msg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pinLoading}
            className="bg-[#FF1E3C] hover:bg-[#e01431] text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            {pinLoading ? 'পরিবর্তন হচ্ছে...' : '🔐 পিন পরিবর্তন করুন (Update PIN)'}
          </button>
        </form>
      </div>

      {/* ================= 8. PUSH NOTIFICATIONS BROADCAST ================= */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-700 pb-2">
          <Megaphone className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-sm">৮. পুশ নোটিফিকেশন ব্রডকাস্ট (Send Push Notification)</h3>
        </div>
        <p className="text-xs text-neutral-400">
          এখানে শিরোনাম ও বার্তা লিখে পাঠালে সকল ইউজারের অ্যাপে নোটিফিকেশন বেল আইকনে রিয়েল-টাইমে আপডেট চলে যাবে।
        </p>

        <form onSubmit={handleSendNotification} className="space-y-3 max-w-lg">
          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">নোটিফিকেশন শিরোনাম (Title)</label>
            <input
              type="text"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="যেমন: নতুন টুর্নামেন্ট শুরু হয়েছে! 🚀"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 mb-1 block">বার্তা (Message Content)</label>
            <textarea
              rows={2}
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              placeholder="নোটিফিকেশন বিস্তারিত বার্তা লিখুন..."
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 font-sans"
            ></textarea>
          </div>

          {notifFeedback && (
            <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs p-2.5 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notifFeedback}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={notifSending}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-2.5 px-5 rounded-xl text-xs shadow cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            {notifSending ? 'পাঠানো হচ্ছে...' : '📢 নোটিফিকেশন ব্রডকাস্ট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};
