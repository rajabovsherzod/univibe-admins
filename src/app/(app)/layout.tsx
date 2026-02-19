// app/(app)/owner/layout.tsx
import { AppSidebar } from "./_components/sidebar/app-sidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-primary">
      <div className="flex w-full gap-6 px-4 py-6 md:px-6">
        <aside className="hidden shrink-0 md:block md:w-[280px] xl:w-[320px]">
          <div className="sticky top-6">
            <AppSidebar role="superadmin" />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* ✅ page o'zi cardlarni boshqaradi */}
          {children}
        </main>
      </div>
    </div>
  );
}
