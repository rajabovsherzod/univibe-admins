'use client';

import { Fragment, useState } from 'react';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { DataTable } from '@/components/application/table/data-table';
import { auditColumns } from './audit-columns';
import { useRedemptionAudit, type RedemptionAuditFilters } from '../../_hooks/use-redemption-audit';
import { cx } from '@/utils/cx';

const PAGE_SIZE = 20;

type TabAction = RedemptionAuditFilters['action'];

interface Tab {
  id: TabAction;
  label: string;
}

const TABS: Tab[] = [
  { id: '', label: 'Barchasi' },
  { id: 'CREATED', label: 'Yaratilgan' },
  { id: 'FULFILLED', label: 'Bajarilgan' },
  { id: 'CANCELED', label: 'Bekor qilingan' },
  { id: 'RETURNED', label: 'Qaytarilgan' },
];

export function AuditClient() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabAction>('');

  const { data, isPending } = useRedemptionAudit({
    page,
    page_size: PAGE_SIZE,
    action: activeTab || undefined,
  });

  const logs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const handleTabChange = (id: TabAction) => {
    setActiveTab(id);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Market", href: "/market" },
          { label: "Audit" },
        ]}
        title="Buyurtmalar auditi"
        subtitle="Sotib olish operatsiyalari loglari va tranzaksiyalar tarixi."
        count={totalCount}
      />

      {/* Table card with tabs */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        {/* Tabs header */}
        <div className="border-b border-secondary bg-primary px-5 pt-4">
          <div className="flex w-max items-center gap-4">
            {TABS.map((tab, idx) => (
              <Fragment key={String(tab.id)}>
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cx(
                    "pb-3 text-sm transition-all duration-200 outline-none border-b-2 whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-brand-solid font-bold text-brand-solid"
                      : "border-transparent font-medium text-secondary hover:border-border-secondary hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
                {idx < TABS.length - 1 && (
                  <div className="mb-3 h-4 w-px bg-secondary" />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <div className="p-5">
          <DataTable
            ariaLabel="Audit loglar jadvali"
            data={logs}
            columns={auditColumns as any}
            rowKey="order_public_id"
            isLoading={isPending}
            emptyTitle="Loglar topilmadi"
            emptyDescription="Sotib olish operatsiyalari mavjud emas."
            pagination={{
              page,
              total: totalPages,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>
    </div>
  );
}
