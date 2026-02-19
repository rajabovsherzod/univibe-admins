"use client";

import React from "react";
import { PageHeader } from "@/components/application/headers/page-header";

export function UniversityStaffDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard (Xodim)"
        subtitle="Xush kelibsiz! Bu yerda sizning faoliyatingiz ko'rinadi."
      />

      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center bg-gray-50">
        <p className="text-gray-500">Xodimlar uchun dashboard hali ishlab chiqilmoqda.</p>
      </div>
    </div>
  );
}
