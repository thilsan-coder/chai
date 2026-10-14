import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  partTag: string;
  features: string[];
  moduleCode: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  partTag,
  features,
  moduleCode,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          {partTag}
        </span>
      </div>

      {/* Main Module Card */}
      <Card>
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={
            <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              Module: {moduleCode}
            </div>
          }
        />

        <div className="mt-4 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">
                UI Shell & Route Configured
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Navigation route is wired, responsive shell is active, and backend integration will be linked in subsequent planned parts.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Planned Capabilities for this Module
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((feat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-zinc-300 p-2 rounded-lg bg-zinc-900 border border-zinc-800/60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-4 h-4 text-amber-500/60" />
            <span>Sri Lankan Cafe Operations • 4:00 PM – 1:00 AM Session</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
              Dashboard
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/pos')}>
              Go to POS Register
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
