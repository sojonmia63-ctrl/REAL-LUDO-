import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Match, AppNotification } from '../types';
import { NoticeBanner } from './NoticeBanner';
import { WalletModal } from './WalletModal';
import { ProfileModal } from './ProfileModal';
import { SupportModal } from './SupportModal';
import { MatchDetailModal } from './MatchDetailModal';
import {
  Gamepad2,
  Wallet,
  Headphones,
  User as UserIcon,
  Plus,
  Trophy,
  Users,
  ShieldCheck,
  Radio,
  ArrowRight,
  Bell,
  X
} from 'lucide-react';

export const UserApp: React.FC = () => {
  const { currentUser, settings, matches, joinMatch, notifications, markNotificationsAsRead } = useApp();

  const [matchTab, setMatchTab] = useState<'up' | 'on' | 'done'>('up');
  const [activeNav, setActiveNav] = useState<'game' | 'wallet' | 'support' | 'profile'>('game');

  // Modals state
  const [showWallet, setShowWallet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Top Toast Popup for new notifications
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const shownToastsRef = useRef<Set<string>>(new Set());

  // Show toast on arrival or app open when there are unread notifications
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      if (activeToast) setActiveToast(null);
      return;
    }
    // Dismiss toast if the current active toast was deleted
    if (activeToast && !notifications.some(n => n.id === activeToast.id)) {
      setActiveToast(null);
    }
    const latestUnread = notifications.find(n => !n.read && !shownToastsRef.current.has(n.id));
    if (latestUnread) {
      shownToastsRef.current.add(latestUnread.id);
      setActiveToast(latestUnread);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notifications, activeToast]);

  // Joining state & feedback
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);

  const filteredMatches = matches.filter(m => m.status === matchTab);

  const handleMatchClick = async (match: Match) => {
    // 1. COMPLETED TAB
    if (match.status === 'done') {
      if (match.isApproved) {
        setJoinSuccessMsg(`ম্যাচ #${match.id} সম্পন্ন হয়েছে (Completed)। অ্যাডমিন কর্তৃক অনুমোদিত।`);
        setTimeout(() => setJoinSuccessMsg(null), 3500);
        return;
      }
      // If still pending review, allow joined user to view status
      setSelectedMatch(match);
      return;
    }

    // 2. UPCOMING TAB (Point 1: Joining from Upcoming does NOT open popup!)
    if (match.status === 'up') {
      const isAlreadyJoined = match.joinedUserIds?.includes(currentUser?.id || '');
      if (isAlreadyJoined) {
        setJoinSuccessMsg(`আপনি ইতিমধ্যে ম্যাচ #${match.id}-এ যুক্ত আছেন! ২য় প্লেয়ার যুক্ত হলে ম্যাচটি Ongoing ট্যাবে চালু হবে।`);
        setTimeout(() => setJoinSuccessMsg(null), 4000);
        return;
      }

      if ((currentUser?.balance || 0) < match.entry) {
        setJoinError(`পর্যাপ্ত ব্যালেন্স নেই! এন্ট্রি ফি ৳${match.entry}। আগে ওয়ালেটে টাকা এড করুন।`);
        setTimeout(() => setJoinError(null), 3500);
        return;
      }

      setJoiningId(match.id);
      const res = await joinMatch(match.id);
      setJoiningId(null);

      if (res.success) {
        // Crucial: Do NOT open popup!
        if (res.isOngoing) {
          setJoinSuccessMsg('২ জন প্লেয়ার যুক্ত হয়েছে! ম্যাচটি এখন Ongoing ট্যাবে চালু হয়েছে।');
          setMatchTab('on');
        } else {
          setJoinSuccessMsg('ম্যাচে সফলভাবে জয়েন করেছেন! ২য় প্লেয়ার যুক্ত হলে ম্যাচটি Ongoing ট্যাবে যাবে।');
        }
        setTimeout(() => setJoinSuccessMsg(null), 4000);
      } else {
        setJoinError(res.message);
        setTimeout(() => setJoinError(null), 3500);
      }
      return;
    }

    // 3. ONGOING TAB (Point 1: Room opening & live chat are in Ongoing tab)
    if (match.status === 'on') {
      const isJoined = match.joinedUserIds?.includes(currentUser?.id || '');
      if (isJoined) {
        setSelectedMatch(match);
      } else {
        setJoinError('আপনি এই ম্যাচটিতে প্লেয়ার হিসেবে যুক্ত নন।');
        setTimeout(() => setJoinError(null), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col justify-between max-w-md mx-auto relative pb-20 shadow-xl">
      {/* Top Main Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#FF1E3C] text-white shadow-md">
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          {/* Avatar and App Title */}
          <div className="flex items-center gap-2.5">
            {/* User Profile Picture (পিপি) */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full bg-white text-[#FF1E3C] flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-amber-300 shadow cursor-pointer hover:scale-105 transition-transform shrink-0"
              title="প্রোফাইল দেখুন"
            >
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="User PP" className="w-full h-full object-cover" />
              ) : settings.defaultAvatarUrl ? (
                <img src={settings.defaultAvatarUrl} alt="Default Avatar" className="w-full h-full object-cover" />
              ) : settings.logoImageUrl ? (
                <img src={settings.logoImageUrl} alt="App Logo Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-[#FF1E3C]" />
              )}
            </button>

            {/* App Brand Logo & Name */}
            <div className="flex items-center gap-2">
              {settings.logoImageUrl && (
                <img
                  src={settings.logoImageUrl}
                  alt={settings.appName}
                  className="w-8 h-8 rounded-lg object-contain bg-white/20 p-0.5 border border-white/30 shadow"
                />
              )}
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span
                    className="text-base font-black text-amber-300 select-none"
                  >
                    {settings.appName || 'Real Ludo'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">
                    {currentUser?.name}
                  </span>
                </div>
                <div className="text-[10px] text-white/80 font-mono mt-0.5">
                  ID: {currentUser?.id || 'RL-000000'}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance & Add Money Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowWallet(true)}
              className="bg-white hover:bg-neutral-50 text-neutral-900 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow cursor-pointer active:scale-95 transition-all border border-neutral-200"
            >
              <span className="text-amber-600">💰</span>
              <span>৳{currentUser?.balance ?? 0}</span>
              <span className="bg-[#00A651] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] ml-0.5">
                <Plus className="w-3 h-3" />
              </span>
            </button>

            {/* Notification Bell Icon */}
            <button
              onClick={() => {
                setShowNotifModal(true);
                markNotificationsAsRead();
              }}
              className="relative bg-white/20 hover:bg-white/30 active:scale-95 text-white p-2 rounded-full cursor-pointer transition-all"
              title="নোটিফিকেশন"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-lg border border-white animate-pulse">
                  {notifications.filter(n => !n.read).length > 99 ? '99+' : notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Notice Banner */}
        <NoticeBanner />

        {/* Tournament Tabs (UPCOMING, ONGOING, COMPLETED) */}
        <div className="flex bg-[#E01431] text-white/80 text-xs font-bold border-t border-white/10">
          <button
            onClick={() => setMatchTab('up')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              matchTab === 'up'
                ? 'text-white border-b-3 border-amber-300 bg-white/10'
                : 'hover:text-white'
            }`}
          >
            UPCOMING
          </button>
          <button
            onClick={() => setMatchTab('on')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              matchTab === 'on'
                ? 'text-white border-b-3 border-amber-300 bg-white/10'
                : 'hover:text-white'
            }`}
          >
            ONGOING
          </button>
          <button
            onClick={() => setMatchTab('done')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              matchTab === 'done'
                ? 'text-white border-b-3 border-amber-300 bg-white/10'
                : 'hover:text-white'
            }`}
          >
            COMPLETED
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 space-y-3">
        {/* Success notification */}
        {joinSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl text-center shadow animate-in fade-in">
            {joinSuccessMsg}
          </div>
        )}

        {/* Error notification */}
        {joinError && (
          <div className="bg-red-500 text-white text-xs font-bold p-2.5 rounded-xl text-center shadow animate-shake">
            {joinError}
          </div>
        )}

        {/* Match List */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 space-y-2">
            <Radio className="w-8 h-8 mx-auto text-neutral-300 animate-pulse" />
            <p className="text-xs font-semibold">এই বিভাগে বর্তমানে কোনো ম্যাচ নেই</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMatches.map((match) => {
              const isJoined = match.joinedUserIds?.includes(currentUser?.id || '');
              const percent = Math.min(100, Math.round((match.players / (match.maxPlayers || 2)) * 100));

              return (
                <div
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className={`bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group ${
                    match.status === 'done' && match.isApproved ? 'cursor-default opacity-90' : 'cursor-pointer'
                  }`}
                >
                  {/* Match Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                      {match.type}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      ম্যাচ #{match.id}
                    </span>
                  </div>

                  {/* Prize Row */}
                  <div className="flex items-center justify-between my-2">
                    <div>
                      <div className="text-[10px] text-neutral-400 font-semibold uppercase">উইন প্রাইজ</div>
                      <div className="text-2xl font-black text-[#FF1E3C] tracking-tight">
                        ৳{match.win}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        মোট প্রাইজ: <span className="font-bold text-neutral-800">৳{match.prize}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 font-semibold uppercase">এন্ট্রি ফি</div>
                      <div className="text-base font-black text-emerald-700">
                        ৳{match.entry}
                      </div>

                      {/* Buttons strictly based on user specifications */}
                      {match.status === 'up' && (
                        <button
                          type="button"
                          disabled={joiningId === match.id}
                          className={`mt-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                            isJoined
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'border-[#FF1E3C] text-[#FF1E3C] hover:bg-[#FF1E3C] hover:text-white'
                          }`}
                        >
                          {joiningId === match.id
                            ? 'জয়েন হচ্ছে...'
                            : isJoined
                            ? 'যুক্ত আছেন (অপেক্ষমাণ)'
                            : 'JOIN'}
                        </button>
                      )}

                      {match.status === 'on' && (
                        <button
                          type="button"
                          className="mt-1 text-xs font-bold px-4 py-1.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white border border-[#00A651] shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          রুম খুলুন
                        </button>
                      )}

                      {match.status === 'done' && (
                        <div
                          className={`mt-1 text-xs font-black px-3.5 py-1.5 rounded-xl text-center select-none inline-block ${
                            match.isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                          }`}
                        >
                          {match.isApproved ? 'Completed' : 'রিভিউ পেন্ডিং'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-3 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        প্লেয়ার: <b className="text-neutral-800">{match.players}/{match.maxPlayers || 2}</b>
                      </span>
                      <span className="font-semibold text-neutral-600">{percent}% ফুল</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF1E3C] h-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-neutral-200 py-1.5 px-2 flex justify-around items-center z-30 shadow-lg">
        <button
          onClick={() => {
            setActiveNav('game');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeNav === 'game' ? 'text-[#FF1E3C] font-black' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Play Game</span>
        </button>

        <button
          onClick={() => {
            setActiveNav('wallet');
            setShowWallet(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeNav === 'wallet' ? 'text-[#FF1E3C] font-black' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Wallet</span>
        </button>

        <button
          onClick={() => {
            setActiveNav('support');
            setShowSupport(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeNav === 'support' ? 'text-[#FF1E3C] font-black' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Headphones className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Support</span>
        </button>

        <button
          onClick={() => {
            setActiveNav('profile');
            setShowProfile(true);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all ${
            activeNav === 'profile' ? 'text-[#FF1E3C] font-black' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

      {/* Popups & Modals */}
      {showWallet && <WalletModal onClose={() => { setShowWallet(false); setActiveNav('game'); }} />}
      {showProfile && <ProfileModal onClose={() => { setShowProfile(false); setActiveNav('game'); }} />}
      {showSupport && <SupportModal onClose={() => { setShowSupport(false); setActiveNav('game'); }} />}
      {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
      {/* Top Floating Notification Toast / Popup */}
      {activeToast && (
        <div className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto animate-in slide-in-from-top duration-300">
          <div
            onClick={() => {
              setActiveToast(null);
              setShowNotifModal(true);
              markNotificationsAsRead();
            }}
            className="bg-neutral-900/95 text-white border-2 border-amber-400 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 cursor-pointer hover:bg-neutral-900 active:scale-98 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  নতুন নোটিফিকেশন
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">{activeToast.time || activeToast.createdAt}</span>
              </div>
              <h4 className="font-bold text-white text-xs truncate mt-0.5">{activeToast.title}</h4>
              <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5 leading-relaxed">{activeToast.message}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-[#FF1E3C] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Bell className="w-5 h-5 text-amber-300" />
                <span>অফিশিয়াল নোটিফিকেশন ও আপডেট</span>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-white/80 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
              {notifications.length === 0 ? (
                <div className="text-center py-14 space-y-2">
                  <div className="text-3xl">📭</div>
                  <p className="text-neutral-400 font-bold text-xs">কোনো নোটিফিকেশন নেই</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white border p-3.5 rounded-2xl shadow-2xs space-y-1.5 transition-all ${
                      !n.read ? 'border-amber-400/80 bg-amber-50/20 ring-1 ring-amber-400/30' : 'border-neutral-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${!n.read ? 'bg-red-500 animate-pulse' : 'bg-neutral-400'}`}></span>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">{n.time || n.createdAt}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed pl-3.5 whitespace-pre-wrap">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => {
                  markNotificationsAsRead();
                  setShowNotifModal(false);
                }}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow transition active:scale-95"
              >
                পড়া হয়েছে ও বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
