import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateAndDownloadApk } from '../utils/apkGenerator';
import {
  Smartphone,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  ShieldCheck,
  FileCode,
  Layers,
  ArrowDownCircle
} from 'lucide-react';

interface AppUpdateModalProps {
  onClose: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({ onClose }) => {
  const { settings, refreshFromFirebase } = useApp();

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatusText, setDownloadStatusText] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentVersion = settings.apkVersion || 'v1.2.0';
  const fileSize = settings.apkFileSize || '12.8 MB';
  const changelog = settings.apkReleaseNotes || '🔥 নতুন আপডেট: লাইভ প্লেয়ার চ্যাট হিস্ট্রি, রুম কোড অটো-ডিটেকশন, ফাস্ট ডিপোজিট ও নেটিভ অ্যান্ড্রয়েড সাপোর্ট।';

  const handleDownloadApk = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    setDownloadError(null);
    setDownloadProgress(10);
    setDownloadStatusText('প্রস্তুতি চলছে...');

    try {
      await generateAndDownloadApk(settings, (pct, status) => {
        setDownloadProgress(pct);
        setDownloadStatusText(status);
      });

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setDownloadProgress(0);
        setDownloadStatusText('');
      }, 8000);
    } catch (err: unknown) {
      console.error('Failed to download APK:', err);
      const msg = err instanceof Error ? err.message : 'APK ডাউনলোড করতে সমস্যা হয়েছে।';
      setDownloadError(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckUpdates = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromFirebase();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white text-neutral-900 w-full max-w-md max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-[#FF1E3C] to-red-700 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">অ্যাপ ডাউনলোড ও আপডেট</h3>
              <p className="text-[11px] text-white/80 font-medium">অফিশিয়াল অ্যান্ড্রয়েড APK ফাইল</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Version & Info Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white p-4 rounded-2xl shadow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>সর্বশেষ সংস্করণ</span>
              </span>
              <button
                onClick={handleCheckUpdates}
                disabled={isRefreshing}
                className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span>চেক করুন</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-white font-mono tracking-tight">{currentVersion}</span>
                <span className="text-xs text-neutral-400 block mt-0.5">অ্যান্ড্রয়েড নেটিভ APK (Capacitor)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-300 block font-mono">{fileSize}</span>
                <span className="text-[10px] text-neutral-400">Android 7.0+ সাপোর্ট</span>
              </div>
            </div>

            {/* Native Capacitor Badge */}
            <div className="bg-neutral-800/80 border border-neutral-700/80 p-2.5 rounded-xl flex items-center gap-2.5 text-xs text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                ১০০% নিরাপদ ও ভেরিফায়েড। কোনো বিজ্ঞাপন ছাড়া ফুলস্ক্রিন ফাস্ট গেমপ্লে।
              </span>
            </div>
          </div>

          {/* Download APK Action Button */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadApk}
              disabled={downloading}
              className="w-full bg-[#FF1E3C] hover:bg-[#e01431] active:scale-[0.98] text-white py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/25 cursor-pointer disabled:opacity-60 transition-all border border-red-400/30"
            >
              <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'APK ফাইল তৈরি হচ্ছে...' : `অ্যান্ড্রয়েড APK ডাউনলোড করুন (${currentVersion})`}</span>
            </button>

            {/* Progress bar */}
            {downloading && (
              <div className="bg-neutral-100 p-3 rounded-xl border border-neutral-200 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-700">
                  <span className="text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    {downloadStatusText || 'প্রসেসিং হচ্ছে...'}
                  </span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF1E3C] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Success message */}
            {downloadSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✅ APK ফাইল সফলভাবে ডাউনলোড শুরু হয়েছে! নোটিফিকেশন থেকে ফাইলটি ওপেন করে ইনস্টল করুন।</span>
              </div>
            )}

            {downloadError && (
              <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>ত্রুটি: {downloadError}</span>
              </div>
            )}
          </div>

          {/* Changelog / Release Notes */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>এই আপডেটে নতুন কী কী আছে?</span>
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans whitespace-pre-line bg-white p-2.5 rounded-xl border border-neutral-200/80">
              {changelog}
            </p>
          </div>

          {/* Android Installation Instructions */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-amber-600" />
              <span>মোবাইলে কীভাবে ইনস্টল করবেন? (৩টি সহজ ধাপ)</span>
            </h4>

            <div className="space-y-2 text-xs text-neutral-700">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  ১
                </span>
                <p className="text-[11px] text-neutral-700 leading-tight">
                  উপরের লাল বাটনে চাপ দিয়ে <b>APK ফাইলটি ডাউনলোড</b> করুন এবং ডাউনলোড শেষ হলে ফাইলটিতে চাপ দিন।
                </p>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  ২
                </span>
                <p className="text-[11px] text-neutral-700 leading-tight">
                  সিকিউরিটি ওয়ার্নিং বা &quot;Install Unknown Apps&quot; আসলে <b>Allow from this source</b> অন করে দিন।
                </p>
              </div>

              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] flex items-center justify-center shrink-0">
                  ৩
                </span>
                <p className="text-[11px] text-neutral-700 leading-tight">
                  এরপর <b>&quot;Install&quot;</b> চাপুন। ইনস্টল শেষে সরাসরি মোবাইল স্ক্রিন থেকে Real Ludo ওপেন করুন!
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-500 font-medium">Real Ludo Android Build Engine</span>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
            
