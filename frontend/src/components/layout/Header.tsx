import React, { useState, useEffect } from 'react';
import { Menu, Search, PlusCircle, Bell, Clock, Calendar, ShieldCheck, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { StaffSwitchModal } from '../auth/StaffSwitchModal';


export interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenTokenLookup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenTokenLookup }) => {
  const navigate = useNavigate();
  const { user, systemStatus } = useAuth();
  const [sriLankaTime, setSriLankaTime] = useState<string>('');
  const [sriLankaDate, setSriLankaDate] = useState<string>('');
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Asia/Colombo
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Colombo',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      setSriLankaTime(timeFormatter.format(now));
      setSriLankaDate(dateFormatter.format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenSearch.trim()) {
      navigate(`/orders?token=${encodeURIComponent(tokenSearch.trim())}`);
      if (onOpenTokenLookup) onOpenTokenLookup();
    }
  };

  const isDbConnected = systemStatus?.database?.connected ?? false;

  return (
    <>
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        {/* Mobile left: Hamburger & Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/oonjal-logo.jpg"
              alt="Oonjal Chai"
              className="w-8 h-8 rounded-lg object-contain border border-amber-500/40"
            />
            <span className="font-bold text-sm text-zinc-100 tracking-tight">Oonjal Chai</span>
          </div>
        </div>

        {/* Desktop Search / Quick Token Lookup */}
        <div className="hidden sm:flex items-center flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Search Token (e.g. #104) or Order..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-20 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-800 border border-zinc-700 rounded text-zinc-400">
                Enter
              </kbd>
            </div>
          </form>
        </div>

        {/* Right controls: Live Colombo Time, Backend Status, Staff Badge & Quick Order */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend API status */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
              isDbConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>API Online</span>
          </div>

          {/* Sri Lanka Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{sriLankaTime || 'Loading...'}</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{sriLankaDate}</span>
            </div>
          </div>

          {/* Staff Switch / Profile Button */}
          <button
            type="button"
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
            title="Switch Staff Role"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">
              {user ? user.role.toUpperCase() : 'STAFF'}
            </span>
          </button>

          {/* Quick notification indicator */}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
            title="Active Kitchen Tokens"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>

          {/* Quick New Order Button */}
          <Button
            size="sm"
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/pos')}
            className="whitespace-nowrap"
          >
            <span className="hidden sm:inline">New POS Order</span>
            <span className="sm:hidden">POS</span>
          </Button>
        </div>
      </header>

      <StaffSwitchModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />
    </>
  );
};
