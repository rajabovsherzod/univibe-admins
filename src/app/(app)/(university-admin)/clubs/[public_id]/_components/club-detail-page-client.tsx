'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useAdminClubDetail, useAdminClubMembers } from '@/hooks/api/use-clubs-admin';
import { Button } from '@/components/base/buttons/button';
import { Edit02, Users02, Award01, Clock, Shield01, Globe01 } from '@untitledui/icons';
import { DataTable, DataTableColumn } from '@/components/application/table/data-table';
import { ClubMembership } from '@/types/clubs';
import { ClubEditModal } from '../../_components/club-edit-modal';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { toHttps } from '@/utils/cx';
import { usePermissions } from '@/hooks/use-permissions';

interface ClubDetailPageClientProps {
  publicId: string;
}

// ── Solid badge ───────────────────────────────────────────────────────────
const solidColorMap = {
  success: 'bg-utility-success-600 text-white',
  error:   'bg-utility-error-600 text-white',
  warning: 'bg-utility-warning-500 text-white',
  brand:   'bg-brand-600 text-white',
  gray:    'bg-utility-gray-600 text-white',
} as const;

function SolidBadge({ color, children }: { color: keyof typeof solidColorMap; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md font-medium px-2 py-0.5 text-xs ${solidColorMap[color]}`}>
      {children}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Sk({ w = 'w-32', h = 'h-4', rounded = 'rounded-md', className = '' }: {
  w?: string; h?: string; rounded?: string; className?: string;
}) {
  return <div className={`${h} ${w} ${rounded} skeleton-shimmer ${className}`} />;
}

// ── Dashboard shadow ──────────────────────────────────────────────────────
const CARD_SHADOW = 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]';

// ── Section header (solid brand bar) ─────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center bg-brand-solid px-5 py-3.5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────
function Card({ title, children, className = '' }: {
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl ${CARD_SHADOW} ring-1 ring-secondary ${className}`}>
      <SectionHeader title={title} />
      <div className="bg-primary">{children}</div>
    </section>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon, label, value, isLoading, skeletonWidth,
}: {
  icon: React.FC<any>; label: string; value?: React.ReactNode | null;
  isLoading?: boolean; skeletonWidth?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-secondary last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <Icon className="size-4 text-tertiary shrink-0" />
        <p className="text-sm text-tertiary whitespace-nowrap">{label}</p>
      </div>
      <div className="text-sm font-medium text-primary text-right">
        {isLoading
          ? <Sk w={skeletonWidth} />
          : (value ?? <span className="text-tertiary italic text-xs">—</span>)}
      </div>
    </div>
  );
}

// ── Stat block ────────────────────────────────────────────────────────────
function StatBlock({ label, value, icon: Icon, isLoading }: {
  label: string; value?: number; icon: React.FC<any>; isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-tertiary">
      <Icon className="size-6 text-brand-600" />
      {isLoading
        ? <Sk w="w-10" h="h-7" rounded="rounded-lg" />
        : <p className="text-2xl font-bold text-primary tabular-nums">{value ?? 0}</p>
      }
      <p className="text-xs text-tertiary text-center">{label}</p>
    </div>
  );
}

// ── Date formatter ────────────────────────────────────────────────────────
const formatDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

// ── Section divider ───────────────────────────────────────────────────────
function SectionDivider({ title, count, isLoading }: {
  title: string; count?: number; isLoading?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="text-brand-600 text-base leading-none select-none">◆</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-tertiary whitespace-nowrap">
        {title}
      </span>
      {isLoading ? (
        <Sk w="w-5" h="h-5" rounded="rounded-full" />
      ) : count !== undefined ? (
        <span className="flex items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold px-2 py-0.5 min-w-[1.25rem]">
          {count}
        </span>
      ) : null}
      <div className="flex-1 h-px bg-secondary" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function ClubDetailPageClient({ publicId }: ClubDetailPageClientProps) {
  const { can } = usePermissions();
  const canUpdate = can('clubs.update');
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: club, isLoading: isLoadingClub }     = useAdminClubDetail(publicId);
  const { data: membersData, isLoading: isLoadingMembers } = useAdminClubMembers(publicId, page, 20);

  if (!isLoadingClub && !club) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-tertiary">Klub topilmadi</p>
      </div>
    );
  }

  const initials  = (club?.name || 'K').slice(0, 2).toUpperCase();
  const logoSrc   = club?.logo   ? toHttps(club.logo)   : null;
  const bannerSrc = club?.banner ? toHttps(club.banner) : null;

  const statusColor: keyof typeof solidColorMap =
    club?.status === 'ACTIVE'   ? 'success' :
    club?.status === 'ARCHIVED' ? 'error'   : 'warning';
  const statusLabel =
    club?.status === 'ACTIVE'   ? 'Faol'        :
    club?.status === 'ARCHIVED' ? 'Arxivlangan' : 'Kutilmoqda';

  const visibilityLabel = club?.visibility === 'PUBLIC' ? 'Ochiq' : 'Yopiq';

  // ── Member columns ────────────────────────────────────────────────────
  const memberColumns = useMemo<DataTableColumn<ClubMembership>[]>(() => [
    {
      id: 'index',
      header: '#',
      accessor: 'public_id' as keyof ClubMembership,
      headClassName: 'w-10',
      cellClassName: 'w-10',
      cell: (_row, index) => (
        <span className="text-sm text-tertiary font-medium tabular-nums">
          #{((page - 1) * 20) + (index ?? 0) + 1}
        </span>
      ),
    },
    {
      id: 'student',
      header: 'Talaba',
      accessor: 'student_name' as keyof ClubMembership,
      isRowHeader: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
            {(row.student_name || 'T').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-primary truncate">{row.student_name || '—'}</span>
            <span className="text-xs text-tertiary">#{row.student_public_id?.split('-')[0]}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Rol',
      accessor: 'role_name' as keyof ClubMembership,
      headClassName: 'w-24',
      cellClassName: 'w-24',
      cell: (row) => (
        <SolidBadge color={row.role_code === 'OWNER' ? 'brand' : 'gray'}>
          {row.role_code === 'OWNER' ? 'Rahbar' : row.role_code === 'MEMBER' ? "A'zo" : (row.role_name || "A'zo")}
        </SolidBadge>
      ),
    },
    {
      id: 'status',
      header: 'Holat',
      accessor: 'status' as keyof ClubMembership,
      headClassName: 'w-20',
      cellClassName: 'w-20',
      cell: (row) => (
        <SolidBadge color={row.status === 'ACTIVE' ? 'success' : 'error'}>
          {row.status === 'ACTIVE' ? 'Faol' : "O'chirilgan"}
        </SolidBadge>
      ),
    },
    {
      id: 'joined_at',
      header: "Qo'shilgan",
      accessor: 'joined_at' as keyof ClubMembership,
      headClassName: 'w-28',
      cellClassName: 'w-28',
      cell: (row) => (
        <span className="text-sm text-tertiary tabular-nums">
          {formatDate(row.joined_at) || '—'}
        </span>
      ),
    },
  ], [page]);

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Page Header */}
      <PageHeaderPro
        title={isLoadingClub ? 'Yuklanmoqda...' : (club?.name ?? '')}
        icon={Users02}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Klublar', href: '/clubs' },
          { label: isLoadingClub ? '...' : (club?.name ?? '') },
        ]}
      />

      {/* ── 1. Banner + Logo hero (full-width) ─────────────────────── */}
      <div className={`rounded-2xl overflow-hidden border border-secondary bg-primary ${CARD_SHADOW}`}>
        <div className="relative h-40 md:h-52 bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 overflow-hidden">
          {!isLoadingClub && bannerSrc && (
            <Image src={bannerSrc} alt="Klub banneri" fill className="object-cover" unoptimized />
          )}
          {!bannerSrc && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-6 size-32 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute bottom-4 right-10 size-24 rounded-full bg-white/20 blur-3xl" />
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          {/* Logo floats over banner */}
          <div className="relative z-10 -mt-10 mb-3 w-fit">
            {isLoadingClub ? (
              <div className="size-20 rounded-xl border-4 border-primary skeleton-shimmer" />
            ) : logoSrc ? (
              <Image
                src={logoSrc}
                alt={club?.name ?? ''}
                width={80}
                height={80}
                className="size-20 rounded-xl object-cover border-4 border-primary shadow-lg bg-primary"
                unoptimized
              />
            ) : (
              <div className="size-20 rounded-xl border-4 border-primary shadow-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white text-xl font-bold tracking-wide">{initials}</span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              {isLoadingClub ? (
                <><Sk w="w-48" h="h-6" rounded="rounded-lg" /><Sk w="w-28" h="h-4" /></>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-primary leading-tight">{club?.name}</h1>
                  <p className="text-sm text-tertiary">{club?.category?.name || 'Kategoriyasiz'}</p>
                </>
              )}
            </div>
            {canUpdate && <Button
              color="primary"
              size="sm"
              iconLeading={Edit02}
              onClick={() => setIsEditModalOpen(true)}
              isDisabled={isLoadingClub}
            >
              Tahrirlash
            </Button>}
          </div>
        </div>
      </div>

      {/* ── 2. Stats + Details side by side (2-col, full-width each) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card title="Ko'rsatkichlar">
          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            <StatBlock label="A'zolar"       value={club?.members_count}   icon={Users02} isLoading={isLoadingClub} />
            <StatBlock label="Kuzatuvchilar" value={club?.followers_count} icon={Award01} isLoading={isLoadingClub} />
          </div>
        </Card>

        <Card title="Ma'lumotlar">
          <div className="px-5 py-1">
            <InfoRow icon={Users02} label="Rahbar"    value={club?.owner?.full_name} isLoading={isLoadingClub} skeletonWidth="w-28" />
            <InfoRow icon={Clock}   label="Yaratilgan" value={formatDate(club?.created_at)} isLoading={isLoadingClub} skeletonWidth="w-24" />
            <InfoRow icon={Globe01} label="Ko'rinish" value={visibilityLabel} isLoading={isLoadingClub} skeletonWidth="w-16" />
            <InfoRow
              icon={Shield01}
              label="Holat"
              value={!isLoadingClub && club
                ? <SolidBadge color={statusColor}>{statusLabel}</SolidBadge>
                : null
              }
              isLoading={isLoadingClub}
              skeletonWidth="w-16"
            />
          </div>
        </Card>
      </div>

      {/* ── 3. Description (full-width) ────────────────────────────── */}
      <Card title="Klub haqida">
        <div className="px-5 py-4 text-sm text-secondary leading-relaxed whitespace-pre-wrap">
          {isLoadingClub ? (
            <div className="flex flex-col gap-2">
              <Sk w="w-full" /><Sk w="w-5/6" /><Sk w="w-4/6" />
            </div>
          ) : (
            club?.description
              ? club.description
              : <span className="italic text-tertiary">Batafsil ma&apos;lumot kiritilmagan.</span>
          )}
        </div>
      </Card>

      {/* ── 4. Members table (full-width, grows freely) ─────────────── */}
      <div className="flex flex-col gap-2">
        <SectionDivider
          title="Klub a'zolari"
          count={club?.members_count}
          isLoading={isLoadingClub}
        />
        <DataTable
          ariaLabel="Klub a'zolari jadvali"
          rowKey="public_id"
          columns={memberColumns}
          data={membersData?.results || []}
          isLoading={isLoadingMembers || isLoadingClub}
          pagination={{
            page: membersData?.pagination?.page || page,
            total: membersData?.pagination?.total_pages || 1,
            totalItems: membersData?.pagination?.total_items || 0,
            onPageChange: setPage,
            pageSize: membersData?.pagination?.page_size || 20,
          }}
          emptyTitle="Hozircha a'zolar yo'q"
          className={CARD_SHADOW}
        />
      </div>

      {club && (
        <ClubEditModal
          club={club}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
