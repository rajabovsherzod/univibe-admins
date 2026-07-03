// app/(app)/_components/app-layout-client.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { AppSidebar } from "./sidebar/app-sidebar";
import { MobileHeader } from "./sidebar/mobile-header";
import { MobileSidebar } from "./sidebar/mobile-sidebar";
import { RouteGuard } from "./route-guard";

export function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // useSession gets the initial value synchronously from the server-passed
  // session (via SessionProvider), so status jumps straight to "authenticated"
  // and never causes a blank repaint.
  const { data: session, status } = useSession();
  // Fall back to "staff" while loading — sidebar renders immediately either way
  const role = (session?.user as any)?.role ?? "staff";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  const handleOpenMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const handleCloseMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const CARD_SHADOW = 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]';

  // IMPORTANT: Never return null/undefined here — always render the full shell.
  // Any blank-screen flash is caused by conditional early returns before this point.
  return (
    // suppressHydrationWarning prevents mismatches from server/client theme class
    <div className="min-h-[100svh] bg-secondary" suppressHydrationWarning>
      <MobileHeader onMenuClick={handleOpenMobileMenu} />
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} role={role} />

      <div className="flex w-full gap-6 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden shrink-0 md:block md:w-[280px] xl:w-[320px]">
          <div className="sticky top-6 h-[calc(100vh-48px)]">
            <AppSidebar role={role} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 flex flex-col">
          <div className={`flex-1 flex flex-col rounded-2xl bg-primary ring-1 ring-secondary overflow-hidden ${CARD_SHADOW}`}>
            <div className="p-4 md:p-6 flex-1">
              <RouteGuard>{children}</RouteGuard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
