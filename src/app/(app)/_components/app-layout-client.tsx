// app/(app)/_components/app-layout-client.tsx
"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "./sidebar/app-sidebar";
import { MobileHeader } from "./sidebar/mobile-header";
import { MobileSidebar } from "./sidebar/mobile-sidebar";

export function AppLayoutClient({
  children,
  role
}: {
  children: React.ReactNode;
  role: string;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-[100svh] bg-secondary">
      <MobileHeader onMenuClick={handleOpenMobileMenu} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} role={role} />

      <div className="flex w-full gap-6 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden shrink-0 md:block md:w-[280px] xl:w-[320px]">
          <div className="sticky top-6 h-[calc(100vh-48px)]">
            <AppSidebar role={role} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl bg-primary p-4 shadow-md ring-1 ring-secondary md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
