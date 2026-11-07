import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Camera,
  Edit2,
  Check,
  Save,
  LogOut,
  CreditCard,
  User as UserIcon,
  Trophy,
  Gamepad2,
  Calendar,
  Smartphone
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
  onOpenUpdate?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, settings, updateUserProfile, logout } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [payNum, setPayNum] = useState(currentUser?.bkashOrNagad || '');
  const [paySaved, setPaySaved] = useState(false);

  // Profile picture upload
  const handleProfilePicUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await updateUserProfile({ profilePic: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = async () => {
    if (editedName.trim().length >= 3) {
      await updateUserProfile({ name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSavePaymentNumber = async () => {
    await updateUserProfile({ bkashOrNagad: payNum.trim() });
    setPaySaved(true);
    setTimeout(() => setPaySaved(false), 2500);
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
          <div className="font-bold text-base">আমার প্রোফাইল</div>
          <div className="w-8"></div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Profile Card Header */}
          <div className="bg-gradient-to-b from-[#FF1E3C] to-[#8B0000] text-white p-5 rounded-2xl text-center relative shadow-md">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <div className="w-24 h-24 rounded-full bg-white text-[#FF1E3C] flex items-center justify-center text-4xl overflow-hidden border-4 border-amber-300 shadow">
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : settings.defaultAvatarUrl ? (
                  <img src={settings.defaultAvatarUrl} alt="Official Avatar" className="w-full h-full object-cover" />
                ) : settings.logoImageUrl ? (
                  <img src={settings.logoImageUrl} alt="App Logo Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-[#FF1E3C]" />
                )}
              </div>
              <label
                htmlFor="profile-pic-upload"
                className="absolute bottom-0 right-0 bg-amber-400 text-neutral-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-amber-300 active:scale-95"
                title="ছবি পরিবর্তন"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProfilePicUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            {/* Name with edit */}
            {isEditingName ? (
              <div className="flex items-center justify-center gap-1 max-w-xs mx-auto mt-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-2 py-1 text-sm text-neutral-900 bg-white rounded-lg focus:outline-none font-bold"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mt-2">
                <h3 className="text-xl font-black text-white">{currentUser?.name}</h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-amber-300 hover:text-white"
                  title="নাম পরিবর্তন করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className="text-xs text-white/80 font-mono mt-0.5">{currentUser?.mobile}</p>

            <div className="inline-block bg-amber-400 text-neutral-950 px-3 py-1 rounded-full text-xs font-black tracking-wider mt-2 shadow">
              🎮 Game ID: {currentUser?.id || 'RL-000000'}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-[10px] text-emerald-800 font-bold block">ব্যালেন্স</span>
              <span className="text-base font-black text-emerald-700">৳{currentUser?.balance ?? 0}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              <div className="flex items-center justify-center gap-1 text-[10px] text-amber-800 font-bold">
                <Trophy className="w-3 h-3 text-amber-600" /> মোট জয়
              </div>
              <span className="text-base font-black text-amber-700">৳{currentUser?.totalWon ?? 0}</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
              <div className="flex items-center justify-center gap-1 text-[10px] text-blue-800 font-bold">
                <Gamepad2 className="w-3 h-3 text-blue-600" /> মোট ম্যাচ
              </div>
              <span className="text-base font-black text-blue-700">{currentUser?.matchesPlayed ?? 0}</span>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs space-y-1.5 text-neutral-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-500">রেজিস্ট্রেশন তারিখ:</span>
              <span className="font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> {currentUser?.joinedAt || 'আজ'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-500">স্ট্যাটাস:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">সক্রিয় (Active)</span>
            </div>
          </div>

          {/* Payment Number Save */}
          <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
              <CreditCard className="w-4 h-4 text-[#FF1E3C]" />
              <span>পেমেন্ট নম্বর (উইথড্র করার ডিফল্ট বিকাশ/নগদ নম্বর)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={11}
                value={payNum}
                onChange={(e) => setPayNum(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#FF1E3C]"
              />
              <button
                type="button"
                onClick={handleSavePaymentNumber}
                className="bg-[#00A651] hover:bg-[#008f45] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {paySaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
                <span>{paySaved ? 'সেভ হয়েছে' : 'সেভ'}</span>
              </button>
            </div>
          </div>

          {/* APK & App Update Button - Controlled by Admin (settings.apkUrl) */}
          {Boolean((settings.apkUrl || '').trim()) && (
            <a
              href={(settings.apkUrl || '').trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3 rounded-xl transition-all shadow text-xs flex items-center justify-center gap-2 cursor-pointer mt-4 no-underline"
            >
              <Smartphone className="w-4 h-4 text-neutral-950" />
              <span>📱 অ্যাপ আপডেট ও APK ডাউনলোড</span>
            </a>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>🚪 LOGOUT (লগআউট)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
