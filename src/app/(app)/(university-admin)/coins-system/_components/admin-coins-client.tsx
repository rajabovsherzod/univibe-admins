"use client";

import { Fragment, useState, Suspense } from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { cx } from "@/utils/cx";
import { PremiumTableSkeleton } from "@/components/application/skeleton/premium-table-skeleton";

import { RulesTab } from "./rules-tab";
import { TransactionsTab } from "./transactions-tab";
import { DeletionAuditsTab } from "./deletion-audits-tab";

export function AdminCoinsClient() {
  const [activeTab, setActiveTab] = useState("rules");

  const tabs = [
    { id: "rules", label: "Qoidalar" },
    { id: "transactions", label: "Tranzaksiyalar" },
    { id: "deletions", label: "O'chirilganlar ro'yxati" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ballar tizimi" },
        ]}
        title="Ballar tizimi"
        subtitle="Talabalar uchun coinlarni va qoidalarni boshqarish markazi."
        icon={CoinOutlineIcon}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="border-b border-secondary bg-primary px-5 pt-4">
          <div className="flex w-max items-center gap-4">
            {tabs.map((tab, idx) => (
              <Fragment key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cx(
                    "pb-3 text-sm transition-all duration-200 outline-none border-b-2",
                    activeTab === tab.id
                      ? "border-brand-solid font-bold text-brand-solid"
                      : "border-transparent font-medium text-secondary hover:border-border-secondary hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
                {idx < tabs.length - 1 && (
                  <div className="mb-3 h-4 w-px bg-secondary" />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="p-5 min-h-[400px]">
          <Suspense fallback={<PremiumTableSkeleton rows={5} />}>
            {activeTab === "rules" && <RulesTab />}
            {activeTab === "transactions" && <TransactionsTab />}
            {activeTab === "deletions" && <DeletionAuditsTab />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
