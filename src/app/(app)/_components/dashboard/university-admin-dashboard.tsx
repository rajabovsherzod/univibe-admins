"use client";

import React from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DashboardSectionCard } from "@/components/application/dashboard/dashboard-section-card";
import { DashboardActivityFeed } from "@/components/application/dashboard/dashboard-activity-feed";
import { DashboardUpcomingEvents } from "@/components/application/dashboard/dashboard-upcoming-events";
import { KpiStatCard } from "@/components/application/dashboard/kpi-stst-card";
import { BarChart01 } from "@untitledui/icons";

const demo = {
  students: [10, 12, 14, 18, 22, 20, 26, 25, 28, 32, 34, 36].map((v) => ({ value: v })),
  events: [2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7].map((v) => ({ value: v })),
  approvals: [8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 10, 9].map((v) => ({ value: v })),
  coins: [120, 140, 160, 220, 180, 260, 300, 280, 340, 360, 420, 460].map((v) => ({ value: v })),
};

export function UniversityAdminDashboard() {
  const activity = [
    { id: "a1", title: "Admin yangi event yaratdi", description: "Hackathon 2026 • Registration ochildi", timeLabel: "Hozir", tone: "info" as const, href: "/dashboard/events/1" },
    { id: "a2", title: "Student ro'yxatdan o'tdi", description: "Azizbek A. • Hackathon 2026", timeLabel: "8 daqiqa oldin", tone: "info" as const },
    { id: "a3", title: "Ro'yxatdan o'tish tasdiqlandi", description: "Dilnoza S. • Case Competition", timeLabel: "1 soat oldin", tone: "success" as const },
    { id: "a4", title: "Coin berildi", description: "Top 3 • 120 coins tarqatildi", timeLabel: "Bugun 13:10", tone: "success" as const },
    { id: "a5", title: "Deadline yaqinlashmoqda", description: "AI Workshop • ro'yxatdan o'tish 1 kunda yopiladi", timeLabel: "Bugun", tone: "warning" as const },
  ];

  const upcoming = [
    { id: "e1", title: "AI Workshop", dateLabel: "05-fev, 10:00", location: "A-301", registrationLabel: "Registration: 1 kun qoldi", capacityLabel: "62/80", status: "closing" as const, href: "/dashboard/events/ai-workshop" },
    { id: "e2", title: "Hackathon 2026", dateLabel: "10-fev, 14:00", location: "Main Hall", registrationLabel: "Registration: 6 kun", capacityLabel: "48/120", status: "open" as const },
    { id: "e3", title: "Case Competition", dateLabel: "12-fev, 09:00", location: "B-112", registrationLabel: "Start: 11 kun", capacityLabel: "36/40", status: "soon" as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeaderPro
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        subtitle="Tizim holati, yaqin eventlar va so'nggi faoliyat."
        icon={BarChart01}
        actions={
          <a
            href="/events/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs ring-0 transition hover:bg-brand-solid_hover"
          >
            Yangi event
          </a>
        }
      />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <KpiStatCard title="Jami studentlar" value="2,184" trend="up" delta="5.2%" deltaLabel="o'tgan oyga nisbatan" data={demo.students} colorClassName="text-fg-brand-secondary" />
        <KpiStatCard title="Faol eventlar" value="7" trend="up" delta="1" deltaLabel="shu haftada" data={demo.events} colorClassName="text-fg-success-secondary" />
        <KpiStatCard title="Pending approvals" value="12" trend="down" delta="−3" deltaLabel="kechagiga nisbatan" data={demo.approvals} colorClassName="text-fg-error-secondary" />
        <KpiStatCard title="Coins tarqatildi (oy)" value="4,620" trend="up" delta="9.1%" deltaLabel="o'tgan oyga nisbatan" data={demo.coins} colorClassName="text-fg-brand-secondary" />
      </div>

      {/* MAIN ROW */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        {/* 70% */}
        <DashboardSectionCard
          className="lg:col-span-7"
          title="So'nggi faoliyat"
          subtitle="Adminlar va tizim bo'yicha oxirgi harakatlar."
          hrefAll="/activity"
        >
          <DashboardActivityFeed items={activity} />
        </DashboardSectionCard>

        {/* 30% */}
        <DashboardSectionCard
          className="lg:col-span-3"
          title="Yaqinlashayotgan eventlar"
          subtitle="Sana, joy va registration holati."
          hrefAll="/events"
        >
          <DashboardUpcomingEvents items={upcoming} />
        </DashboardSectionCard>
      </div>
    </div>
  );
}
