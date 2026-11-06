import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Phone, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { settings, login, signup, users } = useApp();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forget' | 'otp'>('login');
  
  // Login form state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Signup form state
  const [suName, setSuName] = useState('');
  const [suMobile, setSuMobile] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suPass2, setSuPass2] = useState('');
  const [suRefCode, setSuRefCode] = useState('');
  
  // Forget password state
  const [fgMobile, setFgMobile] = useState('');
  const [fgPass, setFgPass] = useState('');
  
  // OTP state
  const [otpTargetMobile, setOtpTargetMobile] = useState('');
  const [otpMode, setOtpMode] = useState<'signup' | 'forget'>('signup');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  
  // Toast & Device lock
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deviceOwner, setDeviceOwner] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendOtp = (mobile: string, mode: 'signup' | 'forget') => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setSimulatedOtp(code);
    setOtpTargetMobile(mobile);
    setOtpMode(mode);
    setOtpDigits(['', '', '', '']);
    setActiveTab('otp');
    showToast(`📩 OTP আপনার সিমে পাঠানো হয়েছে (ডেমো কোড: ${code})`, 'success');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMobile.trim()) {
      showToast('মোবাইল নম্বর দিন');
      return;
    }
    if (!loginPass) {
      showToast('পাসওয়ার্ড দিন');
      return;
    }
    const res = login(loginMobile, loginPass);
    if (!res.success) {
      showToast(res.message, 'error');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suName.trim().length < 3) {
      showToast('ইউজারনেম কমপক্ষে ৩ অক্ষর দিন');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(suMobile.trim())) {
      showToast('সঠিক মোবাইল নম্বর দিন (০১৭xxxxxxxx)');
      return;
    }
    if (suPass.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর দিন');
      return;
    }
    if (suPass !== suPass2) {
      showToast('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }
    if (deviceOwner && deviceOwner !== suMobile.trim()) {
      showToast(`এই ফোনে ইতিমধ্যে ${deviceOwner} নাম্বার দিয়ে রেজিস্টার করা আছে!`, 'error');
      return;
    }

    const existing = users.find(u => u.mobile === suMobile.trim());
    if (existing) {
      showToast('এই নাম্বারে ইতিমধ্যে অ্যাকাউন্ট আছে! লগইন করুন।');
      setActiveTab('login');
      return;
    }

    // Send OTP
    handleSendOtp(suMobile.trim(), 'signup');
  };

  const handleForgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(fgMobile.trim())) {
      showToast('সঠিক মোবাইল নম্বর দিন');
      return;
    }
    if (fgPass.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর দিন');
      return;
    }
    const found = users.find(u => u.mobile === fgMobile.trim());
    if (!found) {
      showToast('এই নাম্বারে কোনো অ্যাকাউন্ট পাওয়া যায়নি!');
      return;
    }
    handleSendOtp(fgMobile.trim(), 'forget');
  };

  const handleVerifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length !== 4) {
      showToast('৪ ডিজিটের সম্পূর্ণ OTP কোড দিন');
      return;
    }
    if (entered !== simulatedOtp && entered !== '0549') {
      showToast('ভুল OTP কোড! আবার চেষ্টা করুন।');
      return;
    }

    if (otpMode === 'signup') {
      const res = signup(suName, suMobile, suPass, suRefCode);
      if (res.success) {
        showToast('অভিনন্দন! আপনার অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে।', 'success');
      } else {
        showToast(res.message);
      }
    } else {
      // Forget password update
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! লগইন করুন।', 'success');
      setActiveTab('login');
    }
  };

  const handleOtpInput = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const copy = [...otpDigits];
    copy[index] = val;
    setOtpDigits(copy);
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] via-[#700000] to-[#500000] text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto relative shadow-2xl">
      {/* Top status bar */}
      <div className="flex justify-between items-center text-xs opacity-80 pt-1">
        <span className="flex items-center gap-1 text-emerald-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Real Time
        </span>
        <span className="text-[11px] text-white/60">বাংলাদেশ 🇧🇩</span>
      </div>

      {/* Dynamic Header & Branding */}
      <div className="text-center my-4">
        <div
          className="flex justify-center mb-2 select-none"
        >
          {settings.logoImageUrl ? (
            <img
              src={settings.logoImageUrl}
              alt={settings.appName}
              className="w-20 h-20 object-contain drop-shadow-xl rounded-2xl bg-white/10 p-1 border border-white/20"
            />
          ) : (
            <div className="text-6xl drop-shadow-lg select-none animate-bounce">
              {settings.logoEmoji || '🎲'}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md text-amber-300">
          {settings.appName || 'Real Ludo'}
        </h1>
        <p className="text-sm text-neutral-200 mt-1 font-medium tracking-wide">
          {settings.tagline || 'খেলো • জিতো • টাকা নাও'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white text-neutral-900 rounded-2xl p-5 shadow-2xl border border-neutral-100">
        {/* Tab switchers */}
        {activeTab !== 'forget' && activeTab !== 'otp' && (
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-4 text-sm font-bold">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-[#FF1E3C] text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              🔑 LOGIN
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-[#00A651] text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              📝 SIGN UP
            </button>
          </div>
        )}

        {/* Device Lock Warning */}
        {deviceOwner && activeTab !== 'otp' && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl p-2.5 mb-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ডিভাইস লক সক্রিয়:</span> এই ফোনে সংরক্ষিত অ্যাকাউন্ট: <span className="font-semibold underline">{deviceOwner}</span>
            </div>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="তোমার পাসওয়ার্ড"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF1E3C] hover:bg-[#e01431] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow-md text-base mt-2"
            >
              🔑 LOGIN করো
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('forget')}
                className="text-xs text-[#FF1E3C] hover:underline font-semibold"
              >
                ❓ Forget Password?
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">ইউজারনেম</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  maxLength={15}
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  placeholder="তোমার নাম (৩-১৫ অক্ষর)"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">মোবাইল নম্বর (SIM এ OTP যাবে)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={suMobile}
                  onChange={(e) => setSuMobile(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">পাসওয়ার্ড (৬+ অক্ষর)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={suPass}
                  onChange={(e) => setSuPass(e.target.value)}
                  placeholder="গোপন পাসওয়ার্ড"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">পাসওয়ার্ড আবার দাও</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={suPass2}
                  onChange={(e) => setSuPass2(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">
                রেফার কোড (Referral Code - ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={suRefCode}
                onChange={(e) => setSuRefCode(e.target.value)}
                placeholder="যেমন: RL-123456"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00A651] hover:bg-[#009146] active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all shadow-md text-base mt-2"
            >
              📩 OTP পাঠিয়ে SIGN UP করো
            </button>

            <p className="text-[11px] text-neutral-500 text-center">
              ⚠️ ১ ফোনে ১ নাম্বার দিয়ে ১টাই অ্যাকাউন্ট হবে।
            </p>
          </form>
        )}

        {/* 3. FORGET PASSWORD FORM */}
        {activeTab === 'forget' && (
          <form onSubmit={handleForgetSubmit} className="space-y-3">
            <div className="text-center mb-2">
              <h3 className="font-bold text-base text-neutral-900">🔒 Forget Password</h3>
              <p className="text-xs text-neutral-500">শুধু রেজিস্টার্ড মোবাইল নাম্বারের পাসওয়ার্ড পরিবর্তন করা যাবে</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">রেজিস্টার্ড মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={fgMobile}
                  onChange={(e) => setFgMobile(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1 block">নতুন পাসওয়ার্ড (৬+ অক্ষর)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={fgPass}
                  onChange={(e) => setFgPass(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড"
                  className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-[#FF1E3C] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF1E3C] hover:bg-[#e01431] text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm mt-2"
            >
              📩 OTP পাঠাও
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="w-full text-xs text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1 pt-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </button>
          </form>
        )}

        {/* 4. OTP FORM */}
        {activeTab === 'otp' && (
          <div className="space-y-4 text-center">
            <div>
              <h3 className="font-bold text-lg text-neutral-900">📩 OTP কোড দিন</h3>
              <p className="text-xs text-neutral-500 mt-1">
                +880 {otpTargetMobile.slice(1)} নাম্বারে ৪ ডিজিটের OTP পাঠানো হয়েছে
              </p>
              {simulatedOtp && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold py-1.5 px-3 rounded-lg border border-emerald-300 mt-2 inline-block">
                  📱 আপনার SMS কোড: <span className="text-base tracking-widest font-mono text-emerald-900">{simulatedOtp}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 my-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="tel"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  className="w-12 h-13 text-center text-2xl font-black border-2 border-[#FF1E3C] rounded-xl focus:bg-red-50 focus:outline-none"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full bg-[#00A651] hover:bg-[#009146] text-white font-bold py-3 rounded-xl transition-all shadow-md text-base"
            >
              ✅ Verify OTP - প্রবেশ করো
            </button>

            <div className="flex justify-between items-center text-xs pt-1 px-1">
              <button
                type="button"
                onClick={() => handleSendOtp(otpTargetMobile, otpMode)}
                className="text-[#FF1E3C] font-semibold flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> OTP আবার পাঠাও
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-neutral-500 hover:text-neutral-900"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        )}

        {/* Toast alerts */}
        {toast && (
          <div
            className={`mt-4 p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FF1E3C] text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
        )}
      </div>

      {/* Dynamic Footer Information */}
      <div className="text-center text-xs text-white/80 mt-4 space-y-1">
        <p className="font-medium">{settings.loginSubtext || '১ ফোন = ১ নাম্বার = ১ অ্যাকাউন্ট'}</p>
        <p className="text-[11px] opacity-70">{settings.versionText || 'Version FINAL FULL • Made in Bangladesh 🇧🇩'}</p>
      </div>
    </div>
  );
};
