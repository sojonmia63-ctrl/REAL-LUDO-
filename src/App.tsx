import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthModal } from './components/AuthModal';
import { UserApp } from './components/UserApp';
import { AdminAuth } from './components/AdminPanel/AdminAuth';
import { AdminLayout } from './components/AdminPanel/AdminLayout';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();

  // Mode: 'admin' by default for preview, 'user' for Gamers/Players app
  const [currentView, setCurrentView] = useState<'user' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#app' || search.includes('view=user')) {
        return 'user';
      }
    }
    return 'admin';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('real_ludo_admin_logged');
      if (saved === 'false') return false;
      return true; // Default authenticated in preview as requested
    } catch {
      return true;
    }
  });

  // Sync hash routing: visiting #admin opens admin panel; #app or empty returns to user app
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '#app' || window.location.hash === '') {
        setCurrentView('user');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem('real_ludo_admin_logged', 'true');
    } catch {}
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('real_ludo_admin_logged');
    } catch {}
    setCurrentView('user');
    window.location.hash = '';
  };

  const handleSwitchToUser = () => {
    setCurrentView('user');
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none sm:select-auto">
      {/* 
        Point 1: User App and Admin Panel Separation.
        Ordinary users see NO admin links or buttons in the User App UI.
        Admin enters via #admin URL or standalone admin.html.
      */}
      <div className="flex-1 flex flex-col">
        {currentView === 'admin' ? (
          isAdminAuthenticated ? (
            <AdminLayout
              onLogoutAdmin={handleAdminLogout}
              onSwitchToUserApp={handleSwitchToUser}
            />
          ) : (
            <AdminAuth
              onSuccess={handleAdminLoginSuccess}
              onBackToApp={handleSwitchToUser}
            />
          )
        ) : (
          currentUser ? (
            <UserApp />
          ) : (
            <AuthModal />
          )
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
