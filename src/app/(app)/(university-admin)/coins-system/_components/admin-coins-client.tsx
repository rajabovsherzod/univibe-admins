"use client";

import { Fragment, useState, Suspense } from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { cx } from "@/utils/cx";
import { PremiumTableSkeleton } from "@/components/application/skeleton/premium-table-skeleton";

import { RulesTab } from "./rules-tab";
import { DeletionAuditsTab } from "./deletion-audits-tab";

export function AdminCoinsClient() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ballar tizimi" },
        ]}
        title="Ballar tizimi"
        subtitle="Talabalar uchun ballarni va qoidalarni boshqarish markazi."
        icon={CoinOutlineIcon}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] ring-1 ring-secondary">
        <div className="p-5 flex flex-col gap-10 min-h-[400px]">
          <Suspense fallback={<PremiumTableSkeleton rows={5} />}>
            <RulesTab />
          </Suspense>

          <div className="flex flex-col gap-4">
            <div className="h-px w-full bg-secondary" />
          </div>

          <Suspense fallback={<PremiumTableSkeleton rows={5} />}>
            <DeletionAuditsTab />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
