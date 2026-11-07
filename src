import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthModal } from './components/AuthModal';
import { UserApp } from './components/UserApp';

const MainAppContent: React.FC = () => {
  const { currentUser } = useApp();
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none sm:select-auto">
      {currentUser ? <UserApp /> : <AuthModal />}
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
