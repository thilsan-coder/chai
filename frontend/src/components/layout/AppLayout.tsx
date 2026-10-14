import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const AppLayout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar and Slide Drawer */}
      <MobileNav
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />
    </div>
  );
};
