"use client";

import { useStatistics } from "@/hooks/api/use-statistics";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DashboardSectionCard } from "@/components/application/dashboard/dashboard-section-card";
import { KpiStatCard } from "@/components/application/dashboard/kpi-stst-card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from "recharts";
import { cx } from "@/utils/cx";

const COLORS = [
  "var(--fg-brand-primary, #0055ff)",
  "var(--fg-error-primary, #ef4444)",
  "var(--fg-warning-primary, #f59e0b)",
  "var(--fg-success-primary, #22c55e)",
  "var(--fg-quaternary, #9ca3af)",
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary border border-secondary shadow-lg rounded-xl p-3 text-sm z-50">
        <p className="font-semibold text-primary mb-2">{label || payload[0]?.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
            <span className="text-secondary">{entry.name}:</span>
            <span className="font-bold text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function StatisticsPage() {
  const { data, isLoading, isError, error } = useStatistics();

  // Create sparkline data from time_series if available
  const coinSparkline = data?.time_series?.map((d) => ({ value: d.coins })) || [];
  const penaltySparkline = data?.time_series?.map((d) => ({ value: d.penalties })) || [];
  const userSparkline = data?.time_series?.map((d) => ({ value: d.coins + d.penalties })) || [];

  const totalFacultyCoins = data?.faculty_distribution?.reduce((acc: number, curr: any) => acc + curr.coins, 0) || 0;
  const totalCoinsText = totalFacultyCoins.toLocaleString();
  const centerFontSize = totalCoinsText.length > 8 ? "20px" : totalCoinsText.length > 5 ? "24px" : "30px";

  const renderSkeletonKpi = (title: string) => (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-secondary_subtle shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] ring-1 ring-secondary ring-inset md:min-w-[280px]">
      <div className="mb-0.5 rounded-t-xl bg-brand-solid px-4 pb-2 pt-3 md:px-5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="relative flex flex-col gap-4 rounded-xl bg-primary px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset md:gap-5 md:px-5">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-1/2 rounded skeleton-shimmer"></div>
        </div>
        <div className="h-14 w-full rounded skeleton-shimmer"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Statistika" },
        ]}
        title="Faollik Statistikasi"
        subtitle="Universitet miqyosida ballar aylanmasi va talabalar faolligi"
      />

      {isError ? (
        <div className="flex h-64 items-center justify-center bg-primary border border-primary rounded-xl shadow-xs">
          <div className="text-error-500 font-medium">
            Statistikani yuklashda xatolik yuz berdi: {error?.message}
          </div>
        </div>
      ) : isLoading || !data ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {renderSkeletonKpi("Jami Berilgan Ballar")}
            {renderSkeletonKpi("Jami Jarimalar")}
            {renderSkeletonKpi("Faol Talabalar (30 kun)")}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardSectionCard title="Kunlik Faollik (Oxirgi 30 kun)" className="h-full flex flex-col">
                <div className="h-[380px] w-full rounded-xl skeleton-shimmer mt-4 flex-1"></div>
              </DashboardSectionCard>
            </div>
            <div>
              <DashboardSectionCard title="Fakultetlar Ulushi" className="h-full flex flex-col">
                <div className="h-[380px] w-full rounded-xl skeleton-shimmer mt-4 flex-1"></div>
              </DashboardSectionCard>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <KpiStatCard
              title="Jami Berilgan Ballar"
              value={data.kpi.total_coins.toLocaleString()}
              trend="up"
              delta="Jami"
              deltaLabel="barcha vaqt"
              data={coinSparkline}
              colorClassName="text-brand-solid"
            />
            <KpiStatCard
              title="Jami Jarimalar"
              value={data.kpi.total_penalties.toLocaleString()}
              trend="down"
              delta="Jami"
              deltaLabel="barcha vaqt"
              data={penaltySparkline}
              colorClassName="text-error-500"
            />
            <KpiStatCard
              title="Faol Talabalar (30 kun)"
              value={data.kpi.active_students.toLocaleString()}
              trend="up"
              delta="30 kunlik"
              deltaLabel="faollik"
              data={userSparkline}
              colorClassName="text-success-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Area Chart */}
            <div className="lg:col-span-2">
              <DashboardSectionCard title="Kunlik Faollik dinamikasi" className="h-full flex flex-col">
                <div className="h-[380px] w-full pt-4 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.time_series}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCoinsMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--fg-brand-primary, #0055ff)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--fg-brand-primary, #0055ff)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPenaltiesMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--fg-error-primary, #ef4444)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--fg-error-primary, #ef4444)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", fontWeight: 500 }}
                        className="text-tertiary"
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "currentColor", fontWeight: 500 }}
                        className="text-tertiary"
                        dx={-10}
                      />
                      <CartesianGrid
                        vertical={false}
                        stroke="var(--border-secondary)"
                        strokeDasharray="4 4"
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent", stroke: "var(--border-secondary)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                      <Area
                        type="monotone"
                        dataKey="coins"
                        name="Berilgan Ballar"
                        stroke="var(--fg-brand-primary, #0055ff)"
                        strokeWidth={3}
                        fill="url(#colorCoinsMain)"
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--bg-primary, #fff)", fill: "var(--fg-brand-primary, #0055ff)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="penalties"
                        name="Jarimalar"
                        stroke="var(--fg-error-primary, #ef4444)"
                        strokeWidth={3}
                        fill="url(#colorPenaltiesMain)"
                        activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--bg-primary, #fff)", fill: "var(--fg-error-primary, #ef4444)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </DashboardSectionCard>
            </div>

            {/* Faculty Donut Chart */}
            <div>
              <DashboardSectionCard title="Fakultetlar Ulushi" className="h-full flex flex-col">
                <div className="w-full flex flex-col pt-4 pb-6 flex-1">
                  {data.faculty_distribution.length > 0 ? (
                    <>
                      <div className="h-[240px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.faculty_distribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={95}
                              paddingAngle={3}
                              dataKey="coins"
                              stroke="var(--bg-primary)"
                              strokeWidth={2}
                            >
                              {data.faculty_distribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                              <Label 
                                content={({ viewBox }: any) => {
                                  const { cx, cy } = viewBox;
                                  return (
                                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                      <tspan x={cx} y={cy - 5} fill="currentColor" className="text-primary font-bold" style={{ fontSize: centerFontSize }}>
                                        {totalCoinsText}
                                      </tspan>
                                      <tspan x={cx} y={cy + 18} fill="currentColor" className="text-secondary text-sm font-medium">
                                        Jami Coinlar
                                      </tspan>
                                    </text>
                                  );
                                }}
                              />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 px-2">
                        {data.faculty_distribution.map((entry: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm font-medium text-secondary break-words flex-1 leading-snug">
                              {entry.name || "Noma'lum"}
                            </span>
                            <span className="text-sm font-bold text-primary shrink-0">
                              {entry.coins.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-tertiary text-sm font-medium">
                      Hali ma'lumot yo'q
                    </div>
                  )}
                </div>
              </DashboardSectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
