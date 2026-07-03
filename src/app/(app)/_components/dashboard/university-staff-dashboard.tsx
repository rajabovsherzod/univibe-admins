"use client";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Home02 } from "@untitledui/icons";
import { BannersSliderAdmin } from "@/components/admins/banners/BannersSliderAdmin";
import { CoinActivityStats } from "./coin-activity-stats";

export function UniversityStaffDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderPro
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Xodim Paneli"
        subtitle="Sizning faoliyatingiz, tizim holati va yaqin jarayonlar."
        icon={Home02}
      />
      
      {/* ── BANNER SLIDER ── */}
      <BannersSliderAdmin />
      
      <CoinActivityStats />
    </div>
  );
}
