'use client';

import { useMemo, useState } from 'react';
import { useAdminClubs } from '@/hooks/api/use-clubs-admin';
import { ClubList, ClubStatus } from '@/types/clubs';
import { DataTable, DataTableColumn } from '@/components/application/table/data-table';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Plus, Users01, Eye, UserCheck01, Toggle03Right } from '@untitledui/icons';
import { useDebounce } from '@/hooks/use-debounce';
import Image from 'next/image';
import { toHttps, cx } from '@/utils/cx';
import { ClubFormModal } from './club-form-modal';
import { ClubStatusModal } from './club-status-modal';
import { ClubOwnerModal } from './club-owner-modal';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { usePermissions } from '@/hooks/use-permissions';

const STATUS_TABS = [
  { id: '', label: 'Barchasi' },
  { id: 'ACTIVE', label: 'Faol' },
  { id: 'INACTIVE', label: 'Nofaol' },
  { id: 'ARCHIVED', label: 'Arxivlangan' },
];

// Solid status badges, hoisted so they're not rebuilt per row/render.
const CLUB_STATUS_MAP: Record<ClubStatus, { label: string; solidClass: string }> = {
  ACTIVE: { label: 'Faol', solidClass: '!bg-utility-success-600 !text-white !ring-transparent' },
  INACTIVE: { label: 'Nofaol', solidClass: '!bg-utility-gray-600 !text-white !ring-transparent' },
  ARCHIVED: { label: 'Arxivlangan', solidClass: '!bg-utility-error-600 !text-white !ring-transparent' },
};

export function ClubsClient() {
  const router = useRouter();
  const { can } = usePermissions();
  const canCreate = can('clubs.create');
  const canSetOwner = can('clubs.owner');
  const canChangeStatus = can('clubs.status');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [status, setStatus] = useState<string>('');
  
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useAdminClubs(
    debouncedSearch,
    status,
    page,
    pageSize
  );

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [statusModalClub, setStatusModalClub] = useState<ClubList | null>(null);
  const [ownerModalClub, setOwnerModalClub] = useState<ClubList | null>(null);

  const columns = useMemo<DataTableColumn<ClubList>[]>(() => [
    {
      id: 'name',
      header: 'Klub',
      accessor: 'name',
      cell: (row) => {
        const logoUrl = toHttps(row.logo);
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border bg-muted shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={row.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground bg-secondary">
                  {row.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{row.name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.short_description || 'Tavsif yo\'q'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'category',
      header: 'Kategoriya',
      accessor: 'category',
      cell: (row) => (
        <Badge type="color" color="gray" className="font-normal text-xs bg-slate-50 dark:bg-slate-900/50">
          {row.category?.name || 'Kategoriyasiz'}
        </Badge>
      ),
    },
    {
      id: 'owner',
      header: 'Rahbar',
      accessor: 'owner',
      cell: (row) => {
        if (!row.owner) {
          return <span className="text-xs text-muted-foreground italic">Tayinlanmagan</span>;
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.owner.full_name}</span>
            <span className="text-xs text-muted-foreground">ID: {row.owner.public_id.split('-')[0]}</span>
          </div>
        );
      },
    },
    {
      id: 'members_count',
      header: 'A\'zolar',
      accessor: 'members_count',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium">{row.members_count}</span>
          <span className="text-muted-foreground text-xs">ta</span>
        </div>
      ),
    },
    {
      id: 'followers_count',
      header: 'Obunachilar',
      accessor: 'followers_count',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium">{row.followers_count ?? 0}</span>
          <span className="text-muted-foreground text-xs">ta</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Holat',
      accessor: 'status',
      cell: (row) => {
        const config = CLUB_STATUS_MAP[row.status];
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
      headClassName: 'w-32',
      cellClassName: 'w-32',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Batafsil ko'rish" placement="top" delay={200}>
            <Button
              color="tertiary"
              size="sm"
              iconLeading={(props: any) => <Eye {...props} className="!text-brand-600" />}
              onClick={() => router.push(`/clubs/${row.public_id}`)}
              aria-label="Batafsil"
            />
          </Tooltip>
          {canSetOwner && (
            <Tooltip title="Rahbar tayinlash" placement="top" delay={200}>
              <Button
                color="tertiary"
                size="sm"
                iconLeading={(props: any) => <UserCheck01 {...props} className="!text-brand-600" />}
                onClick={() => setOwnerModalClub(row)}
                aria-label="Rahbar tayinlash"
              />
            </Tooltip>
          )}
          {canChangeStatus && (
            <Tooltip title="Holat o'zgartirish" placement="top" delay={200}>
              <Button
                color="tertiary"
                size="sm"
                iconLeading={(props: any) => <Toggle03Right {...props} className="!text-utility-success-600" />}
                onClick={() => setStatusModalClub(row)}
                aria-label="Holat o'zgartirish"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ], [router, canSetOwner, canChangeStatus]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Klublar" },
        ]}
        title="Klublar"
        subtitle="Universitet klublarini yaratish va boshqarish paneli."
        icon={Users01}
        showSearch
        searchValue={searchTerm}
        onSearch={(val) => { setSearchTerm(val); setPage(1); }}
        searchPlaceholder="Klub nomi bo'yicha qidiring..."
        actions={
          canCreate ? (
            <Button iconLeading={Plus} onClick={() => setIsFormModalOpen(true)}>
              Yangi klub
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg overflow-x-auto w-full sm:w-max">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setStatus(tab.id); setPage(1); }}
                className={cx(
                  "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 sm:flex-none",
                  status === tab.id
                    ? "bg-brand-solid text-white shadow-sm"
                    : "text-tertiary hover:text-secondary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
            ariaLabel="Klublar ro'yxati"
            rowKey="public_id"
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            pagination={
              data && data.pagination
                ? {
                    page,
                    total: data.pagination.total_pages || 1,
                    onPageChange: setPage,
                    showRange: true,
                    totalItems: data.pagination.total_items,
                    pageSize: data.pagination.page_size,
                  }
                : undefined
            }
            emptyTitle="Klublar topilmadi."
            emptyDescription={
              searchTerm
                ? "Boshqa kalit so'z bilan qidiring."
                : "Hozircha hech qanday klub yaratilmagan."
            }
          />
      </div>

      {/* Modals */}
      <ClubFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      />
      
      {statusModalClub && (
        <ClubStatusModal
          club={statusModalClub}
          isOpen={!!statusModalClub}
          onClose={() => setStatusModalClub(null)}
        />
      )}

      {ownerModalClub && (
        <ClubOwnerModal
          club={ownerModalClub}
          isOpen={!!ownerModalClub}
          onClose={() => setOwnerModalClub(null)}
        />
      )}
    </div>
  );
}
