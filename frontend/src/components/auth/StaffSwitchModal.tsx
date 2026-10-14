import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { KeyRound, Check, LogOut, AlertCircle } from 'lucide-react';


export const StaffSwitchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, loginWithPin, logout } = useAuth();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset accounts seeded for Oonjal Chai
  const staffPresets = [
    { name: 'Owner (Admin)', role: 'owner', pin: '1111', email: 'owner@oonjalchai.lk', badge: 'Full Access' },
    { name: 'Shift Manager', role: 'manager', pin: '2222', email: 'manager@oonjalchai.lk', badge: 'Supervisor' },
    { name: 'Front Cashier', role: 'cashier', pin: '3333', email: 'cashier@oonjalchai.lk', badge: 'POS Terminal' },
    { name: 'Kitchen Master', role: 'kitchen', pin: '4444', email: 'kitchen@oonjalchai.lk', badge: 'Token Display' },
    { name: 'Stock Manager', role: 'stock_manager', pin: '5555', email: 'stock@oonjalchai.lk', badge: 'Inventory' },
  ];

  const handleQuickLogin = async (pinCode: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPin(pinCode);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithPin(pin);
      setPin('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid PIN code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Station Authentication"
      subtitle="Quick switch staff roles with station PIN code or select active profile"
    >
      <div className="space-y-4">
        {user ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                {user.role.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">{user.name}</p>
                <p className="text-[11px] text-amber-400 uppercase font-mono font-bold tracking-wider">
                  Role: {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={async () => {
                await logout();
                onClose();
              }}
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Currently in Guest / Demo station mode. Authenticate below.</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Quick Staff Select Cards */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            One-Tap Switch (Seeded Staff Accounts)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {staffPresets.map((preset) => {
              const isCurrent = user?.email === preset.email;
              return (
                <button
                  key={preset.pin}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(preset.pin)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs truncate">{preset.name}</p>
                    <p className="text-[10px] text-zinc-500">PIN: {preset.pin} • {preset.badge}</p>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fast Custom 4-digit PIN form */}
        <form onSubmit={handleCustomPinSubmit} className="pt-2 border-t border-zinc-800">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Or Enter Staff PIN Code:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN (e.g. 1111)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 tracking-widest text-center"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!pin || isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Unlock'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
