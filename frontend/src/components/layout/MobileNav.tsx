import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  UtensilsCrossed,
  Menu,
  X,
  Layers,
  Sparkles,
  Boxes,
  Truck,
  Building2,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Clock,
} from 'lucide-react';
import { navigationSections, BUSINESS_CONFIG } from '../../constants/theme';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calculator,
  Receipt,
  UtensilsCrossed,
  Layers,
  Sparkles,
  Boxes,
  Truck,
  Building2,
  Wallet,
  BarChart3,
  Users,
  Settings,
};

export interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isDrawerOpen,
  onCloseDrawer,
  onOpenDrawer,
}) => {
  return (
    <>
      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/90 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </NavLink>

        {/* Center Prominent POS Button */}
        <NavLink
          to="/pos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center -mt-4 p-2 rounded-2xl shadow-lg border transition-transform active:scale-95 ${
              isActive
                ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-amber-500/30'
                : 'bg-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20'
            }`
          }
        >
          <Calculator className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[10px] font-bold uppercase mt-0.5 px-1">POS</span>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </NavLink>

        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-over Mobile Drawer */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-sm bg-zinc-950 border-r border-zinc-800 h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header with Logo */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/oonjal-logo.jpg"
                  alt="Oonjal Chai"
                  className="w-10 h-10 rounded-xl object-contain border border-amber-500/40"
                />
                <div>
                  <h2 className="font-bold text-sm text-zinc-100">{BUSINESS_CONFIG.name}</h2>
                  <p className="text-[10px] text-amber-400">{BUSINESS_CONFIG.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseDrawer}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Business Session Banner */}
            <div className="p-3 bg-zinc-900/60 border-b border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sri Lanka Session
                </span>
                <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
                  <Clock className="w-3 h-3" /> 4 PM - 1 AM
                </span>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {navigationSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {section.title}
                  </h4>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const IconComponent = iconMap[item.icon] || LayoutDashboard;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onCloseDrawer}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                                : 'text-zinc-300 hover:bg-zinc-900'
                            }`
                          }
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-4 h-4 text-amber-400" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Staff Info */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-200">Owner / Cashier Access</p>
              <p className="text-[11px] text-zinc-500">Sri Lanka Asia/Colombo Station</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
