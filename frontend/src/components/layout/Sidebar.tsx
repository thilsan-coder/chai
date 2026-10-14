import React from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  Clock,
  Sparkle,
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

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800/80 sticky top-0 shrink-0 select-none">
      {/* Brand Header with Official Logo */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black border border-amber-500/40 p-1 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10">
            <img
              src="/oonjal-logo.jpg"
              alt="Oonjal Chai"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-zinc-100 tracking-tight truncate">
                {BUSINESS_CONFIG.name}
              </h1>
              <Sparkle className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            </div>
            <p className="text-[11px] text-amber-400/90 font-medium truncate">
              {BUSINESS_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Cafe Live Status Pill */}
        <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Live Session</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <Clock className="w-3 h-3" />
            <span>4 PM - 1 AM</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const IconComponent = iconMap[item.icon] || LayoutDashboard;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                              item.badge === 'Fast POS'
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Cashier / Staff Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-500/30">
              OC
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Owner / Cashier</p>
              <p className="text-[10px] text-zinc-400 truncate">Station 01 • Main Desk</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>
    </aside>
  );
};
