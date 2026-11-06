import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Match } from '../../types';
import {
  Gamepad2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Crown,
  Key,
  X,
  Trophy
} from 'lucide-react';

export const AdminMatches: React.FC = () => {
  const { matches, adminCreateMatch, adminUpdateMatch, adminDeleteMatch } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoomMatch, setEditingRoomMatch] = useState<Match | null>(null);
  const [newRoomCode, setNewRoomCode] = useState('');

  // Add match form
  const [prize, setPrize] = useState(100);
  const [win, setWin] = useState(55);
  const [entry, setEntry] = useState(25);
  const [type, setType] = useState('PLAYER 1VS1 PLAYER');
  const [maxPlayers, setMaxPlayers] = useState(2);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminCreateMatch({
      prize,
      win,
      entry,
      type,
      players: 0,
      maxPlayers,
      status: 'up'
    });
    setShowAddModal(false);
  };

  const handleSaveRoomCode = async () => {
    if (!editingRoomMatch) return;
    await adminUpdateMatch({
      ...editingRoomMatch,
      roomCode: newRoomCode.trim()
    });
    setEditingRoomMatch(null);
  };

  const handleToggleStatus = async (m: Match) => {
    const nextStatus = m.status === 'up' ? 'on' : m.status === 'on' ? 'done' : 'up';
    await adminUpdateMatch({ ...m, status: nextStatus });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            <span>লুডু টুর্নামেন্ট ও ম্যাচ ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            নতুন ম্যাচ তৈরি করুন, রুম কোড দিন বা ম্যাচের ফলাফল ও স্ট্যাটাস পরিবর্তন করুন
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#00A651] hover:bg-[#008f45] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> নতুন ম্যাচ তৈরি করুন
        </button>
      </div>

      {/* Add Match Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
              <h3 className="font-bold text-white text-sm">নতুন ম্যাচ তৈরি করুন</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 mb-1 block">ম্যাচ টাইপ</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold"
                >
                  <option value="PLAYER 1VS1 PLAYER">PLAYER 1VS1 PLAYER</option>
                  <option value="AUTO MATCH">AUTO MATCH</option>
                  <option value="SPECIAL TOURNAMENT">SPECIAL TOURNAMENT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-1 block">মোট প্রাইজ (৳)</label>
                  <input
                    type="number"
                    value={prize}
                    onChange={(e) => setPrize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-1 block">উইন প্রাইজ (৳)</label>
                  <input
                    type="number"
                    value={win}
                    onChange={(e) => setWin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold text-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-1 block">এন্ট্রি ফি (৳)</label>
                  <input
                    type="number"
                    value={entry}
                    onChange={(e) => setEntry(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 mb-1 block">প্লেয়ার সংখ্যা</label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-neutral-700 text-white py-2 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00A651] hover:bg-[#008f45] text-white py-2 rounded-xl text-xs font-bold"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Code Modal */}
      {editingRoomMatch && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-white text-sm">
              ম্যাচ #{editingRoomMatch.id} এর Ludo King Room Code দিন
            </h3>
            <input
              type="text"
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
              placeholder="যেমন: 08392102"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-amber-300 text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingRoomMatch(null)}
                className="flex-1 bg-neutral-700 text-white py-2 rounded-xl text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveRoomCode}
                className="flex-1 bg-[#FF1E3C] hover:bg-[#e01431] text-white py-2 rounded-xl text-xs font-bold"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => (
          <div key={m.id} className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black text-amber-400">{m.type}</span>
                <div className="text-[11px] text-neutral-400">ম্যাচ #{m.id}</div>
              </div>
              <button
                onClick={() => handleToggleStatus(m)}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  m.status === 'up'
                    ? 'bg-blue-950 text-blue-300 border-blue-600'
                    : m.status === 'on'
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}
              >
                {m.status === 'up' ? 'UPCOMING' : m.status === 'on' ? 'ONGOING' : 'COMPLETED'}
              </button>
            </div>

            <div className="flex justify-between items-center bg-neutral-900 p-2.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 block">মোট প্রাইজ</span>
                <span className="font-bold text-white">৳{m.prize}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-300 block">উইন প্রাইজ</span>
                <span className="font-black text-amber-300">৳{m.win}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block">এন্ট্রি</span>
                <span className="font-bold text-emerald-400">৳{m.entry}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block">প্লেয়ার</span>
                <span className="font-bold text-white">{m.players}/{m.maxPlayers || 2}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>কোড: {m.roomCode || 'দেওয়া হয়নি'}</span>
              </div>
              <button
                onClick={() => {
                  setEditingRoomMatch(m);
                  setNewRoomCode(m.roomCode || '');
                }}
                className="text-[10px] text-amber-300 bg-neutral-700 hover:bg-neutral-600 px-2 py-1 rounded-lg font-semibold"
              >
                রুম কোড দিন
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-neutral-400">
                {m.joinedUserIds?.length || 0} জন জয়েন করেছে
              </span>
              <button
                onClick={() => adminDeleteMatch(m.id)}
                className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                title="ম্যাচ মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
