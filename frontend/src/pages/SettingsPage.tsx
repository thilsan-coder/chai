import React, { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Save,
  RotateCcw,
  Wifi,
  Receipt,
  Server,
  Database,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  currencySymbol: string;
  shiftStart: string;
  shiftEnd: string;
  timezone: string;
  tokenResetTime: string;
  tokenStartNumber: number;
  receiptHeader: string;
  receiptSubheader: string;
  receiptFooter: string;
  receiptWifiSsid: string;
  receiptWifiPass: string;
  receiptShowVat: boolean;
  paperWidth: '80mm' | '58mm';
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Oonjal Chai - Sri Lankan Chai & Street Food',
  tagline: 'Kadai Chai, Hot Kottu & Good Vibes',
  phone: '+94 77 123 4567',
  email: 'contact@oonjalchai.lk',
  address: '142 Main Street, Colombo 03, Sri Lanka',
  currency: 'LKR',
  currencySymbol: 'Rs.',
  shiftStart: '16:00',
  shiftEnd: '01:00',
  timezone: 'Asia/Colombo (UTC+05:30)',
  tokenResetTime: '16:00',
  tokenStartNumber: 101,
  receiptHeader: 'OONJAL CHAI - CAFE & STREET FOOD',
  receiptSubheader: 'Thank you for visiting! Nandri / Bohoma Istuti',
  receiptFooter: 'Hot Chai, Warm Hearts. Come again soon!',
  receiptWifiSsid: 'OonjalChai-Guest',
  receiptWifiPass: 'kadaiChai2026',
  receiptShowVat: false,
  paperWidth: '80mm',
};

const STORAGE_KEY = 'oonjal_chai_store_settings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'shift' | 'receipt' | 'system'>('profile');
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Quick API health ping
    fetch('http://127.0.0.1:8000/api/reports/today-summary')
      .then((res) => {
        if (res.ok) setApiStatus('online');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all business settings back to default Sri Lankan Chai Cafe defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem(STORAGE_KEY);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Business Settings & Configuration
            </h1>
            <p className="text-sm text-zinc-400">
              Customize cafe profile, 4 PM – 1 AM shift rules, 80mm thermal receipts, and system options
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition shadow-lg shadow-amber-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Store Profile & Brand', icon: Store },
          { id: 'shift', label: 'Shift Hours & Token Reset', icon: Clock },
          { id: 'receipt', label: '80mm Thermal Receipt', icon: Printer },
          { id: 'system', label: 'System & Connectivity', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <form onSubmit={handleSave}>
        {/* TAB 1: Store Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 space-y-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Cafe Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Store Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Cafe Tagline & Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Telephone Contact
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Inquiry Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    value={settings.currency}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Brand Card & Logo Preview */}
            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/30 p-1 bg-zinc-950 shadow-xl shadow-amber-500/5">
                  <img
                    src="/oonjal-logo.jpg"
                    alt="Oonjal Chai Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Oonjal Chai</h3>
                  <p className="text-xs text-amber-400 mt-0.5">Authentic Kadai Tea & Street Bites</p>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Official Logo active in Header, Login & Thermal Slips
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Licensed Sri Lankan Cafe POS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Shift Hours & Token Reset */}
        {activeTab === 'shift' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Operating Shift Boundary (4:00 PM – 1:00 AM)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Oonjal Chai operates across midnight. Orders placed between midnight and 1:00 AM are
                  accurately attributed to the active evening shift session.
                </p>
              </div>

              {/* Visual Shift Timeline */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-3">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-3.5 h-3.5" /> Shift Opens: 4:00 PM
                  </span>
                  <span className="text-zinc-500">Peak Hours: 7:00 PM – 11:30 PM</span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Clock className="w-3.5 h-3.5" /> Shift Closes: 1:00 AM (Next Day)
                  </span>
                </div>

                <div className="h-4 rounded-full bg-zinc-900 overflow-hidden flex border border-zinc-800">
                  <div className="w-[66.6%] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 h-full relative group">
                    <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  </div>
                  <div className="w-[33.4%] bg-gradient-to-r from-amber-600 to-rose-500 h-full" />
                </div>

                <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-2">
                  <span>16:00 (Token Reset to #101)</span>
                  <span>00:00 Midnight (Continuous Session)</span>
                  <span>01:00 Closing & Cash Till Reconciliation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.shiftStart}
                    onChange={(e) => setSettings({ ...settings, shiftStart: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Shift End Time (Next Day)
                  </label>
                  <input
                    type="time"
                    value={settings.shiftEnd}
                    onChange={(e) => setSettings({ ...settings, shiftEnd: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Operating Timezone
                  </label>
                  <input
                    type="text"
                    value={settings.timezone}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Token Sequence Reset Rules</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Daily Reset Time
                    </label>
                    <input
                      type="time"
                      value={settings.tokenResetTime}
                      onChange={(e) => setSettings({ ...settings, tokenResetTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Starting Token Number
                    </label>
                    <input
                      type="number"
                      value={settings.tokenStartNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, tokenStartNumber: parseInt(e.target.value) || 101 })
                      }
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Thermal Receipt Customizer */}
        {activeTab === 'receipt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
            {/* Form Fields */}
            <div className="space-y-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Thermal Print Slip Layout</span>
              </h2>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Receipt Header Title
                </label>
                <input
                  type="text"
                  value={settings.receiptHeader}
                  onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Subheader Greeting (Tamil & Sinhala)
                </label>
                <input
                  type="text"
                  value={settings.receiptSubheader}
                  onChange={(e) => setSettings({ ...settings, receiptSubheader: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Footer Farewell Note
                </label>
                <input
                  type="text"
                  value={settings.receiptFooter}
                  onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Customer Wi-Fi SSID
                  </label>
                  <input
                    type="text"
                    value={settings.receiptWifiSsid}
                    onChange={(e) => setSettings({ ...settings, receiptWifiSsid: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Customer Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={settings.receiptWifiPass}
                    onChange={(e) => setSettings({ ...settings, receiptWifiPass: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Thermal Paper Width
                </label>
                <div className="flex gap-3">
                  {(['80mm', '58mm'] as const).map((width) => (
                    <button
                      key={width}
                      type="button"
                      onClick={() => setSettings({ ...settings, paperWidth: width })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                        settings.paperWidth === width
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {width} Standard ESC/POS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Receipt Preview */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-4 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                Live Thermal Slip Preview ({settings.paperWidth})
              </span>

              {/* The Paper */}
              <div
                className={`bg-amber-50/95 text-zinc-900 font-mono text-xs p-5 rounded-lg shadow-2xl space-y-3 border-t-8 border-amber-600/30 ${
                  settings.paperWidth === '80mm' ? 'w-72' : 'w-56'
                }`}
              >
                <div className="text-center space-y-1">
                  <div className="font-bold text-sm tracking-tight">{settings.receiptHeader}</div>
                  <div className="text-[10px] text-zinc-600">{settings.address}</div>
                  <div className="text-[10px] text-zinc-600">Tel: {settings.phone}</div>
                  <div className="text-[10px] italic text-zinc-500">{settings.receiptSubheader}</div>
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-2 flex justify-between text-[11px]">
                  <span>Token: #142</span>
                  <span>Table: T-04</span>
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between">
                  <span>Date: 2026-10-24 19:45</span>
                  <span>Cashier: Ruwan</span>
                </div>

                <div className="border-t border-dashed border-zinc-400 pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>2x Cardamom Chai</span>
                    <span>Rs. 360</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Chicken Kottu</span>
                    <span>Rs. 1,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Spicy Mutton Roll</span>
                    <span>Rs. 500</span>
                  </div>
                </div>

                <div className="border-t border-b border-zinc-800 py-1.5 space-y-0.5 font-bold">
                  <div className="flex justify-between text-sm">
                    <span>TOTAL:</span>
                    <span>Rs. 2,010.00</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-normal text-zinc-600">
                    <span>Paid via: Cash</span>
                    <span>Change: Rs. 490.00</span>
                  </div>
                </div>

                <div className="text-center text-[10px] space-y-1 pt-1">
                  <div className="flex items-center justify-center gap-1 text-zinc-600">
                    <Wifi className="w-3 h-3" />
                    <span>Wi-Fi: {settings.receiptWifiSsid}</span>
                  </div>
                  <div className="text-zinc-500">Pass: {settings.receiptWifiPass}</div>
                  <div className="italic pt-2 text-zinc-700">{settings.receiptFooter}</div>
                  <div className="text-[9px] text-zinc-400">--- Powered by Oonjal POS ---</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: System & Connectivity */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Backend API
                  </span>
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      apiStatus === 'online'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-sm font-bold text-white capitalize">
                    {apiStatus === 'online' ? 'Online (Port 8000)' : 'Reconnecting...'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Laravel REST Engine</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Database
                  </span>
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold text-white">oonjal_chai (MariaDB)</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Connected on 127.0.0.1:3306</p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Shift Mode
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-sm font-bold text-white">4:00 PM – 1:00 AM Active</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">Daily Automated Roll-Over</p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-2">Hardware & Printer Interface</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Recommended hardware specifications for Oonjal Chai counter:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="font-semibold text-amber-400">Thermal Printer</span>
                  <p className="text-zinc-500">Epson TM-T82III / Xprinter XP-N160M (USB / LAN 80mm)</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="font-semibold text-cyan-400">Barcode / QR Scanner</span>
                  <p className="text-zinc-500">2D QR Counter Scanner for LankaPay & Bank Receipts</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="font-semibold text-emerald-400">Cash Drawer</span>
                  <p className="text-zinc-500">RJ11 24V Electronic trigger connected to receipt printer</p>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1">
                  <span className="font-semibold text-purple-400">Kitchen Display (KDS)</span>
                  <p className="text-zinc-500">10-inch Android Tablet or Chrome touchscreen display</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
