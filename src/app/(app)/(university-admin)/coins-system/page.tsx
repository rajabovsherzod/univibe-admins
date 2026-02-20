"use client";

import { useState } from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Coins02 } from "@untitledui/icons";

// We will import these once we create them
import { RulesTab } from "./_components/rules-tab";
import { TransactionsTab } from "./_components/transactions-tab";
import { DeletionAuditsTab } from "./_components/deletion-audits-tab";

// Untitled UI Tab component mimic (since we are creating a custom layout)
function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex w-full items-center gap-6 border-b border-secondary">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative pb-3 text-sm font-semibold transition-colors
              ${isActive ? "text-brand-solid" : "text-tertiary hover:text-secondary"}
            `}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-solid rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function CoinsSystemPage() {
  const [activeTab, setActiveTab] = useState("rules");

  const tabs = [
    { id: "rules", label: "Qoidalar" },
    { id: "transactions", label: "Tranzaksiyalar (Audit)" },
    { id: "deletions", label: "O'chirilganlar" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Coins tizimi" },
        ]}
        title="Coins tizimi"
        subtitle="Talabalar uchun coinlarni va qoidalarni boshqarish markazi."
        icon={Coins02}
      />

      {/* Main Container */}
      <div className="flex flex-col gap-4 rounded-2xl bg-primary p-5 shadow-sm ring-1 ring-secondary">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-2 min-h-[400px]">
          {activeTab === "rules" && <RulesTab />}
          {activeTab === "transactions" && <TransactionsTab />}
          {activeTab === "deletions" && <DeletionAuditsTab />}
        </div>
      </div>
    </div>
  );
}