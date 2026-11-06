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
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-[#FF1E3C] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Bell className="w-5 h-5 text-amber-300" />
                <span>অফিশিয়াল নোটিফিকেশন ও আপডেট</span>
              </div>
              <button onClick={() => setShowNotifModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
              {notifications.length === 0 ? (
                <p className="text-center text-neutral-400 py-12 text-xs">কোনো নোটিফিকেশন নেই</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="bg-white border border-neutral-200/80 p-3.5 rounded-2xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF1E3C]"></span>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">{n.createdAt}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed pl-3.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t border-neutral-200 text-center">
              <button
                onClick={() => setShowNotifModal(false)}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
