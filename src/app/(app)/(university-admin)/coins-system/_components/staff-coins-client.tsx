"use client";

import { Fragment, useState, Suspense } from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { cx } from "@/utils/cx";
import { PremiumTableSkeleton } from "@/components/application/skeleton/premium-table-skeleton";

import { RulesTab } from "./rules-tab";

export function StaffCoinsClient() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ballar tizimi" },
        ]}
        title="Ballar tizimi"
        subtitle="Siz amalga oshirishingiz mumkin bo'lgan mavjud ball berish qoidalari va tranzaksiyalar."
        icon={CoinOutlineIcon}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] ring-1 ring-secondary">
        <div className="p-5 min-h-[400px]">
          <Suspense fallback={<PremiumTableSkeleton rows={5} />}>
            <RulesTab />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
