"use client";

import React from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { SectionCard } from "@/components/application/section-card/section-card";
import { DashboardActivityFeed } from "@/components/application/dashboard/dashboard-activity-feed";
import { DashboardUpcomingEvents } from "@/components/application/dashboard/dashboard-upcoming-events";
import { KpiStatCard } from "@/components/application/dashboard/kpi-stst-card";
import { Home02 } from "@untitledui/icons";

const demo = {
  students: [10, 12, 14, 18, 22, 20, 26, 25, 28, 32, 34, 36].map((v) => ({ value: v })),
  events: [2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7].map((v) => ({ value: v })),
  approvals: [8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 10, 9].map((v) => ({ value: v })),
  coins: [120, 140, 160, 220, 180, 260, 300, 280, 340, 360, 420, 460].map((v) => ({ value: v })),
};

export function UniversityStaffDashboard() {
  const activity = [
    { id: "a1", title: "Xodim yangi tadbirga yozildi", description: "Hackathon 2026", timeLabel: "Hozir", tone: "info" as const, href: "/dashboard/events/1" },
    { id: "a2", title: "Talaba ro'yxatdan o'tdi", description: "Azizbek A. • Ubaydullayev", timeLabel: "8 daqiqa oldin", tone: "info" as const },
    { id: "a3", title: "Arizalar tasdiqlandi", description: "Dilnoza S. va 3 ta talaba", timeLabel: "1 soat oldin", tone: "success" as const },
    { id: "a4", title: "Ball berildi", description: "Top faollariga • 120 Ball tarqatildi", timeLabel: "Bugun 13:10", tone: "success" as const },
    { id: "a5", title: "Deadline yaqinlashmoqda", description: "Hujjat topshirish • 1 kunda yopiladi", timeLabel: "Bugun", tone: "warning" as const },
  ];

  const upcoming = [
    { id: "e1", title: "Seminar mashg'ulotlari", dateLabel: "05-fev, 10:00", location: "A-301", registrationLabel: "Vaqt: 1 kun qoldi", capacityLabel: "62/80", status: "closing" as const },
    { id: "e2", title: "Universitet tadbiri", dateLabel: "10-fev, 14:00", location: "Main Hall", registrationLabel: "Kutilyapti: 6 kun", capacityLabel: "48/120", status: "open" as const },
    { id: "e3", title: "Case Competition", dateLabel: "12-fev, 09:00", location: "B-112", registrationLabel: "Start: 11 kun", capacityLabel: "36/40", status: "soon" as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeaderPro
        breadcrumbs={[{ label: "Dashboard" }]}
        title="Xodim Paneli"
        subtitle="Sizning faoliyatingiz, tizim holati va yaqin jarayonlar."
        icon={Home02}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <KpiStatCard title="Ushlangan talabalar" value="482" trend="up" delta="2.1%" deltaLabel="o'tgan oyga" data={demo.students} colorClassName="text-fg-brand-secondary" />
        <KpiStatCard title="Xodim tadbirlari" value="3" trend="up" delta="1" deltaLabel="shu haftada" data={demo.events} colorClassName="text-fg-success-secondary" />
        <KpiStatCard title="Kutilayotganlar" value="12" trend="down" delta="−3" deltaLabel="kechagiga nisbatan" data={demo.approvals} colorClassName="text-fg-error-secondary" />
        <KpiStatCard title="Tarqatilgan Ballar" value="460" trend="up" delta="9.1%" deltaLabel="o'tgan oyga nisbatan" data={demo.coins} colorClassName="text-fg-brand-secondary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <SectionCard
          className="lg:col-span-7"
          title="So'nggi faoliyat"
          description="Sizning operatsiyalar va tasdiqlash harakatlaringiz."
          hrefAll="/activity"
        >
          <DashboardActivityFeed items={activity} />
        </SectionCard>

        <SectionCard
          className="lg:col-span-3"
          title="Yaratilgan ishlar"
          description="Holat va topshiriqlar jadvallari."
          hrefAll="/events"
        >
          <DashboardUpcomingEvents items={upcoming} />
        </SectionCard>
      </div>
    </div>
  );
}
