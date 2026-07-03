"use client";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Home02 } from "@untitledui/icons";
import { BannersSliderAdmin } from "@/components/admins/banners/BannersSliderAdmin";
import { CoinActivityStats } from "./coin-activity-stats";

export function UniversityAdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderPro
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        subtitle="Tizim holati, yaqin eventlar va so'nggi faoliyat."
        icon={Home02}
      />
      
      {/* ── BANNER SLIDER ── */}
      <BannersSliderAdmin />
      
      <CoinActivityStats />
    </div>
  );
}
