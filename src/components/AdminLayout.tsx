import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminDeposits } from './AdminDeposits';
import { AdminWithdraws } from './AdminWithdraws';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';
import { AdminMatches } from './AdminMatches';
import { AdminClaims } from './AdminClaims';
import { AdminExport } from './AdminExport';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Settings,
  Gamepad2,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Database,
  Trophy,
  FileArchive,
  Download
} from 'lucide-react';

interface AdminLayoutProps {
  onLogoutAdmin: () => void;
  onSwitchToUserApp: () => void;
}

export type AdminTab = 'overview' | 'deposits' | 'withdraws' | 'claims' | 'users' | 'settings' | 'matches' | 'source';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogoutAdmin, onSwitchToUserApp }) => {
  const { depositRequests, withdrawRequests, matchClaims, isSyncing, refreshFromFirebase } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const pendingDepositsCount = depositRequests.filter(d => d.status === 'pending').length;
  const pendingWithdrawsCount = withdrawRequests.filter(w => w.status === 'pending').length;
  const pendingClaimsCount = matchClaims.filter(c => c.status === 'pending').length;

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'deposits', label: 'ডিপোজিট রিকোয়েস্ট', icon: ArrowDownCircle, badge: pendingDepositsCount },
    { id: 'withdraws', label: 'উইথড্র রিকোয়েস্ট', icon: ArrowUpCircle, badge: pendingWithdrawsCount },
    { id: 'claims', label: 'ম্যাচ রেজাল্ট ও প্রুফ', icon: Trophy, badge: pendingClaimsCount },
    { id: 'users', label: 'ইউজার ও ব্যালেন্স', icon: Users },
    { id: 'settings', label: 'লোগো, লিমিট ও সেটিংস', icon: Settings },
    { id: 'matches', label: 'টুর্নামেন্ট ও ম্যাচ', icon: Gamepad2 },
    { id: 'source', label: '📦 সোর্স কোড ডাউনলোড', icon: FileArchive, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Branding */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="text-2xl">🎲</div>
              <div>
                <h1 className="font-black text-sm text-white tracking-wide">Real Ludo Admin</h1>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  RTDB Connected
                </span>
              </div>
            </div>
            <button
              onClick={() => refreshFromFirebase()}
              disabled={isSyncing}
              className="text-neutral-400 hover:text-white p-1 rounded-lg"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF1E3C] text-white shadow-md'
                      : item.highlight
                      ? 'text-amber-300 hover:text-white hover:bg-neutral-800/80 border border-amber-500/30 bg-amber-950/20'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.highlight && !isActive ? 'text-amber-400' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="bg-amber-400 text-neutral-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[9px] font-black uppercase">
                      ZIP
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-neutral-800 space-y-2">
          <button
            onClick={() => setActiveTab('source')}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>সোর্স কোড জিপ (.ZIP)</span>
          </button>
          <button
            onClick={onSwitchToUserApp}
            className="w-full flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF1E3C]" />
            <span>ইউজার অ্যাপে ফিরুন</span>
          </button>
          <button
            onClick={onLogoutAdmin}
            className="w-full flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 py-1.5 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>এডমিন লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-neutral-900/80 backdrop-blur border-b border-neutral-800 px-6 py-3 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('source')}
              className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-red-900/70 to-amber-900/70 hover:from-red-800 hover:to-amber-800 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/40 transition-all cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>সোর্স কোড ডাউনলোড</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>real-ludo-c4611-default-rtdb</span>
            </div>
            <button
              onClick={onSwitchToUserApp}
              className="md:hidden text-xs font-bold text-amber-300 bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700"
            >
              📱 অ্যাপ
            </button>
          </div>
        </header>

        {/* Dynamic Body Component */}
        <main className="p-4 sm:p-6 flex-1">
          {activeTab === 'overview' && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />}
          {activeTab === 'deposits' && <AdminDeposits />}
          {activeTab === 'withdraws' && <AdminWithdraws />}
          {activeTab === 'claims' && <AdminClaims />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'matches' && <AdminMatches />}
          {activeTab === 'source' && <AdminExport />}
        </main>
      </div>
    </div>
  );
};
