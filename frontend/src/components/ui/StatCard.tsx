import React from 'react';
import { Card } from './Card';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  accent?: 'gold' | 'emerald' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon: Icon,
  badge,
  accent = 'gold',
}) => {
  const accentColors = {
    gold: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:border-amber-500/40',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:border-emerald-500/40',
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:border-blue-500/40',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:border-purple-500/40',
    },
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-zinc-700/80">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-zinc-400 tracking-wider uppercase">{title}</span>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1 tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${accentColors[accent].bg} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {(change || subtext || badge) && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          {change && (
            <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {change}
            </span>
          )}
          {subtext && <span className="text-zinc-500">{subtext}</span>}
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-amber-400 border border-amber-500/20">
              {badge}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
