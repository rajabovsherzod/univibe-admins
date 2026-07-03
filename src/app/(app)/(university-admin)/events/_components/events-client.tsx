'use client';

import { useState } from 'react';
import { useAdminEvents, useAdminPendingEventsCount } from '@/hooks/api/use-events-admin';
import { EventDetail } from '@/types/events';
import { DataTable, DataTableColumn } from '@/components/application/table/data-table';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Calendar, Eye, Plus, Edit05 } from '@untitledui/icons';
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { cx, toHttps } from '@/utils/cx';
import Image from 'next/image';
import { usePermissions } from '@/hooks/use-permissions';

export function EventsClient() {
  const router = useRouter();
  const { can } = usePermissions();

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [activeTab, setActiveTab] = useState('ALL');
  const canPublish = can('events.publish');
  // Live "manage-all" grant shows the edit action on every event immediately
  // (no wait for a list refetch). Per-row `can_manage` still covers "own only".
  const canManageAll = can('events.manage');

  const { data, isLoading } = useAdminEvents(page, pageSize, activeTab);
  // Live count of events awaiting approval — only for those who can approve.
  const { data: pendingCount = 0 } = useAdminPendingEventsCount({ enabled: canPublish });

  const columns: DataTableColumn<EventDetail>[] = [
    {
      id: 'title',
      header: 'Tadbir nomi',
      accessor: 'title',
      cell: (row) => {
        const bannerUrl = toHttps(row.banner);
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-16 overflow-hidden rounded-md border bg-muted shrink-0">
              {bannerUrl ? (
                <Image
                  src={bannerUrl}
                  alt={row.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground bg-secondary">
                  Rasm yo'q
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[200px]">{row.title}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(row.start_time).toLocaleDateString('uz-UZ')}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'organizer',
      header: 'Tashkilotchi',
      accessor: 'organizer_staff_name',
      cell: (row) => (
        <span className="text-sm font-medium">
          {row.organizer_club_name || row.organizer_staff_name || 'Noma\'lum'}
        </span>
      ),
    },
    {
      id: 'participants',
      header: 'Qatnashchilar',
      accessor: 'registered_count',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium">{row.registered_count}</span>
          <span className="text-muted-foreground text-xs">/ {row.participant_limit || '∞'}</span>
        </div>
      ),
    },
    {
      id: 'coin_reward',
      header: 'Coin',
      accessor: 'coin_reward',
      cell: (row) => (
        <div className="inline-flex items-center gap-1.5 font-semibold text-sm text-brand-600">
          <CoinOutlineIcon className="w-5 h-5" />
          <span>+{row.coin_reward}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Holat',
      accessor: 'status',
      cell: (row) => {
        const statusMap: Record<EventDetail['status'], { label: string; solidClass: string }> = {
          DRAFT: { label: 'Qoralama', solidClass: '!bg-utility-gray-600 !text-white' },
          PENDING_APPROVAL: { label: 'Kutilmoqda', solidClass: '!bg-utility-warning-600 !text-white' },
          PUBLISHED: { label: 'Faol', solidClass: '!bg-utility-success-600 !text-white' },
          REJECTED: { label: 'Rad etilgan', solidClass: '!bg-utility-error-600 !text-white' },
          CANCELLED: { label: 'Bekor qilingan', solidClass: '!bg-utility-error-600 !text-white' },
          COMPLETED: { label: 'Yakunlangan', solidClass: '!bg-utility-blue-600 !text-white' },
        };
        const config = statusMap[row.status];
        return (
          <Badge type="color" className={config.solidClass}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Amallar',
      headClassName: 'w-24',
      cellClassName: 'w-24',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Batafsil ko'rish" placement="top" delay={200}>
            <Button
              color="tertiary"
              size="sm"
              iconLeading={(props: any) => <Eye {...props} className="!text-brand-600" />}
              onClick={() => router.push(`/events/${row.public_id}`)}
              aria-label="Batafsil"
            />
          </Tooltip>
          {(canManageAll || row.can_manage) && (
            <Tooltip title="Tahrirlash" placement="top" delay={200}>
              <Button
                color="tertiary"
                size="sm"
                iconLeading={(props: any) => <Edit05 {...props} className="!text-brand-600" />}
                onClick={() => router.push(`/events/edit/${row.public_id}`)}
                aria-label="Tahrirlash"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const eventsData = Array.isArray(data) ? data : data?.results || [];
  const totalCount = Array.isArray(data) ? data.length : data?.count || 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tadbirlar" },
        ]}
        title="Tadbirlar"
        subtitle="Universitet tadbirlarini yaratish va boshqarish paneli."
        icon={Calendar}
        actions={
          can("events.create") ? (
            <Button iconLeading={Plus} onClick={() => router.push('/events/create')}>
              Yangi tadbir
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg self-start">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'DRAFT', label: 'Qoralamalar' },
            { id: 'PENDING_APPROVAL', label: 'Kutilmoqda' },
            { id: 'PUBLISHED', label: 'Faol' },
            { id: 'COMPLETED', label: 'Yakunlangan' },
            { id: 'REJECTED', label: 'Rad etilgan' },
            { id: 'CANCELLED', label: 'Bekor qilingan' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cx(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1.5",
                activeTab === tab.id
                  ? "bg-brand-solid text-white shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
              {tab.id === 'PENDING_APPROVAL' && canPublish && pendingCount > 0 && (
                <span className={cx(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  activeTab === tab.id ? "bg-white text-brand-solid" : "bg-brand-solid text-white"
                )}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary p-5">
        <DataTable
            ariaLabel="Tadbirlar ro'yxati"
            rowKey="public_id"
            columns={columns}
            data={eventsData}
            isLoading={isLoading}
            pagination={
              totalCount > 0 && !Array.isArray(data)
                ? {
                    page,
                    total: Math.ceil(totalCount / pageSize),
                    onPageChange: setPage,
                    showRange: true,
                    totalItems: totalCount,
                    pageSize: pageSize,
                  }
                : undefined
            }
            emptyTitle="Tadbirlar topilmadi."
            emptyDescription="Hozircha hech qanday tadbir yaratilmagan."
          />
        </div>
      </div>
    </div>
  );
}
