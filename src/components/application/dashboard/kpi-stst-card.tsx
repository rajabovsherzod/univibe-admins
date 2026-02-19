"use client";

import React, { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { MoreVertical } from "lucide-react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type Trend = "up" | "down" | "flat";

export type KpiStatCardProps = {
  title: string;
  value: string | number;
  trend?: Trend;
  delta?: string; // "2.4%"
  deltaLabel?: string; // "vs last month"
  data?: Array<{ value: number }>;
  colorClassName?: string; // "text-fg-brand-secondary" kabi
};

function TrendBadge({ trend = "up", delta = "0%" }: { trend?: Trend; delta?: string }) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cx(
          "size-4 stroke-[3px]",
          isUp && "text-fg-success-secondary",
          isDown && "text-fg-error-secondary",
          trend === "flat" && "text-fg-quaternary"
        )}
      >
        {isDown ? (
          // down-right
          <path d="M22 17l-7.869-7.869c-.396-.396-.594-.594-.822-.668a1 1 0 0 0-.618 0c-.228.074-.426.272-.822.668L9.13 11.87c-.396.396-.594.594-.822.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668L2 7M22 17h-7m7 0v-7" />
        ) : (
          // up-right (default)
          <path d="M22 7l-7.869 7.869c-.396.396-.594.594-.822.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668L9.13 12.13c-.396-.396-.594-.594-.822-.668a1 1 0 0 0-.618 0c-.228.074-.426.272-.822.668L2 17M22 7h-7m7 0v7" />
        )}
      </svg>

      <span
        className={cx(
          "text-sm font-medium",
          isUp && "text-success-primary",
          isDown && "text-error-primary",
          trend === "flat" && "text-tertiary"
        )}
      >
        {delta}
      </span>
    </div>
  );
}

export function KpiStatCard({
  title,
  value,
  trend = "up",
  delta = "0%",
  deltaLabel = "o‘tgan oyga nisbatan",
  data = [],
  colorClassName = "text-fg-brand-secondary",
}: KpiStatCardProps) {
  const gid = useId();
  const gradientId = `kpi-gradient-${gid}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-secondary_subtle shadow-md ring-1 ring-secondary ring-inset md:min-w-[280px]">
      {/* title bar — brand-solid in BOTH light & dark */}
      <div className="mb-0.5 rounded-t-xl bg-brand-solid px-4 pb-2 pt-3 md:px-5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      {/* inner */}
      <div className="relative flex flex-col gap-4 rounded-xl bg-primary px-4 py-5 shadow-xs ring-1 ring-secondary ring-inset md:gap-5 md:px-5">
        {/* value + delta */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-display-sm font-semibold text-primary">{value}</p>

            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <TrendBadge trend={trend} delta={delta} />
              </div>
              <span className="text-sm font-medium text-tertiary">{deltaLabel}</span>
            </div>
          </div>
        </div>

        {/* sparkline */}
        <div className={cx("h-14 w-full", colorClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="currentColor" stopOpacity={1} />
                  <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border-secondary, rgba(0,0,0,.08))",
                  background: "var(--bg-primary, white)",
                  boxShadow: "var(--shadow-xs, 0 1px 2px rgba(0,0,0,.08))",
                  fontSize: 12,
                }}
                formatter={(val: any) => [val, "Qiymat"]}
                labelFormatter={() => ""}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={0.2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: "currentColor" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* menu button */}
        <div className="absolute right-4 top-4 md:right-5 md:top-5">
          <button
            type="button"
            aria-label="Menu"
            className="rounded-md text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:text-tertiary"
            onClick={() => console.log("card menu")}
          >
            <MoreVertical className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
