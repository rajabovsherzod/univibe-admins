'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { DataTable } from '@/components/application/table/data-table';
import { createOrderColumns } from './order-columns';
import { useAdminOrders, type OrdersFilters } from '../_hooks/use-orders-admin';
import { OrderDetailModal } from './order-detail-modal';
import { Badge } from '@/components/base/badges/badges';
import { cx } from '@/utils/cx';

const PAGE_SIZE = 20;

type TabStatus = OrdersFilters['status'];

interface Tab {
  id: TabStatus;
  label: string;
}

export function OrdersClient() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabStatus>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isPending } = useAdminOrders({
    page,
    page_size: PAGE_SIZE,
    status: activeTab || undefined,
  });

  // Fetch pending count independently for tab badge
  const { data: pendingData } = useAdminOrders({ status: 'PENDING', page_size: 1 });
  const pendingCount = pendingData?.count ?? 0;

  const orders = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const handleView = useCallback((id: string) => setSelectedOrderId(id), []);

  const columns = useMemo(() => createOrderColumns(handleView), [handleView]);

  const tabs: Tab[] = [
    { id: '', label: 'Barchasi' },
    { id: 'PENDING', label: 'Kutilmoqda' },
    { id: 'FULFILLED', label: 'Tasdiqlangan' },
    { id: 'CANCELED', label: 'Bekor qilingan' },
    { id: 'RETURNED', label: 'Qaytarilgan' },
  ];

  const handleTabChange = (id: TabStatus) => {
    setActiveTab(id);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeaderPro
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Market", href: "/market" },
            { label: "Buyurtmalar" },
          ]}
          title="Talabalar Buyurtmalari"
          subtitle="Marketdan xarid qilingan mahsulotlarni tasdiqlash va boshqarish."
          count={totalCount}
        />

        {/* Table card with tabs */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
          {/* Tabs header */}
          <div className="border-b border-secondary bg-primary px-5 pt-4">
            <div className="flex w-max items-center gap-4">
              {tabs.map((tab, idx) => (
                <Fragment key={String(tab.id)}>
                  <button
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={cx(
                      "flex items-center gap-1.5 pb-3 text-sm transition-all duration-200 outline-none border-b-2 whitespace-nowrap",
                      activeTab === tab.id
                        ? "border-brand-solid font-bold text-brand-solid"
                        : "border-transparent font-medium text-secondary hover:border-border-secondary hover:text-primary"
                    )}
                  >
                    {tab.label}
                    {tab.id === "PENDING" && pendingCount > 0 && (
                      <Badge color="brand" size="sm" className="!bg-brand-solid !text-white !ring-brand-solid shadow-sm ml-1">
                        +{pendingCount}
                      </Badge>
                    )}
                  </button>
                  {idx < tabs.length - 1 && (
                    <div className="mb-3 h-4 w-px bg-secondary" />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* DataTable */}
          <div className="p-5">
            <DataTable
              ariaLabel="Buyurtmalar jadvali"
              data={orders}
              columns={columns as any}
              rowKey="public_id"
              isLoading={isPending}
              emptyTitle="Buyurtmalar topilmadi"
              emptyDescription="Hozircha hech qanday talaba buyurtma bermagan."
              pagination={{
                page,
                total: totalPages,
                onPageChange: setPage,
              }}
            />
          </div>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}
