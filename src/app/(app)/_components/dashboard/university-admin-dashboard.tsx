"use client";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Home02, BarChart01 } from "@untitledui/icons";

export function UniversityAdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderPro
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        subtitle="Tizim holati, yaqin eventlar va so'nggi faoliyat."
        icon={Home02}
      />
      <ComingSoon />
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="rounded-2xl border border-secondary bg-primary overflow-hidden">
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200 dark:ring-brand-500/20 flex items-center justify-center mb-5">
          <BarChart01 size={24} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-lg font-bold text-primary mb-2">Tez orada</h2>
        <p className="text-sm text-tertiary max-w-sm leading-relaxed">
          Statistika, harakatlar tarixi, KPI ko&apos;rsatkichlari va boshqa tahliliy ma&apos;lumotlar tez orada qo&apos;shiladi.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full ring-1 ring-brand-200 dark:ring-brand-500/20">
          <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
          Ishlab chiqilmoqda
        </div>
      </div>
    </div>
  );
}
