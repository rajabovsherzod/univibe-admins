// app/(app)/layout.tsx
// 1:1 copy of pro-project owner/layout.tsx, adapted for Univibe
"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
import { MobileHeader } from "./_components/sidebar/mobile-header";
import { MobileSidebar } from "./_components/sidebar/mobile-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-[100svh] bg-secondary">
      {/* Mobile Header - visible only on mobile */}
      <MobileHeader onMenuClick={handleOpenMobileMenu} />

      {/* Mobile Sidebar - slide-in drawer */}
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />

      <div className="flex w-full gap-6 px-4 py-4 md:px-6 md:py-6">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden shrink-0 md:block md:w-[280px] xl:w-[320px]">
          <div className="sticky top-6 h-[calc(100vh-48px)]">
            <AppSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl bg-primary p-4 shadow-md ring-1 ring-secondary md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
