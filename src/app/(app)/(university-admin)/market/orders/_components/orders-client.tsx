'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
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

  const { data: session } = useSession();
  const canManage = session?.user?.role === "staff";

  const handleView = useCallback((id: string) => setSelectedOrderId(id), []);

  const columns = useMemo(() => createOrderColumns(handleView, canManage), [handleView, canManage]);

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
        <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg overflow-x-auto w-full sm:w-max">
              {tabs.map((tab) => (
                <button
                  key={String(tab.id)}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cx(
                    "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5",
                    activeTab === tab.id
                      ? "bg-brand-solid text-white shadow-sm"
                      : "text-tertiary hover:text-secondary"
                  )}
                >
                  {tab.label}
                  {tab.id === "PENDING" && pendingCount > 0 && (
                    <Badge color={activeTab === "PENDING" ? "gray" : "brand"} size="sm" className={cx(
                      activeTab === "PENDING" ? "!bg-white/20 !text-white !ring-transparent" : "!bg-brand-solid !text-white !ring-brand-solid",
                      "shadow-sm ml-1"
                    )}>
                      +{pendingCount}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* DataTable */}
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
