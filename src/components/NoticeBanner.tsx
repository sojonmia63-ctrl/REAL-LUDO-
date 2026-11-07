import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  const { settings } = useApp();

  if (!settings.noticeEnabled || !settings.noticeText) return null;

  return (
    <div className="bg-amber-500 text-neutral-950 px-3 py-1.5 text-xs font-semibold flex items-center gap-2 overflow-hidden shadow-inner">
      <Megaphone className="w-4 h-4 shrink-0 text-neutral-900 animate-pulse" />
      <div className="overflow-hidden whitespace-nowrap w-full">
        <div className="inline-block animate-marquee whitespace-nowrap pl-4">
          {settings.noticeText}
        </div>
      </div>
    </div>
  );
};
