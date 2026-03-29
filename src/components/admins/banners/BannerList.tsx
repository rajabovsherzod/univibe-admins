'use client';

import * as React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBannersList, useDeleteBanner } from '@/hooks/api/use-banners-admin';
import type { BannerManagement } from '@/types/admins/banners';
import { Table, TableCard } from '@/components/application/table/table';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Edit05, Trash01, Image01 } from '@untitledui/icons';
import { toHttps } from '@/utils/cx';
import { toast } from 'sonner';
import { DeleteBannerModal } from './DeleteBannerModal';

/** Format ISO date string to DD.MM.YYYY */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

const STATUS_LABELS = {
  DRAFT: 'Qoralama',
  PUBLISHED: "E'lon qilingan",
  ARCHIVED: 'Arxivlangan',
};

// Wrapper for Next/Image with error handling
function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="relative w-32 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
        <svg className="size-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-32 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
      <NextImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// Professional Banner Row Skeleton
function BannerRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-secondary px-6 py-4">
      {/* Image placeholder - 32x16 */}
      <div className="h-16 w-32 shrink-0 rounded-lg bg-secondary skeleton-shimmer" />
      
      {/* Title & subtitle */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded bg-secondary skeleton-shimmer" />
      </div>
      
      {/* Scope badge */}
      <div className="h-6 w-20 rounded-full bg-secondary skeleton-shimmer" />
      
      {/* Status badge */}
      <div className="h-6 w-24 rounded-full bg-secondary skeleton-shimmer" />

      {/* Active badge */}
      <div className="h-6 w-16 rounded-full bg-secondary skeleton-shimmer" />
      
      {/* Order number */}
      <div className="h-4 w-8 rounded bg-secondary skeleton-shimmer" />
      
      {/* Schedule text */}
      <div className="h-3 w-24 rounded bg-secondary skeleton-shimmer" />
      
      {/* Action buttons */}
      <div className="flex gap-1">
        <div className="h-8 w-8 rounded-lg bg-secondary skeleton-shimmer" />
        <div className="h-8 w-8 rounded-lg bg-secondary skeleton-shimmer" />
      </div>
    </div>
  );
}

export function BannerList() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [bannerToDelete, setBannerToDelete] = React.useState<BannerManagement | null>(null);
  
  // Management endpoint - faqat o'z universiteti
  const { data, isLoading } = useBannersList(page, pageSize);
  const deleteMutation = useDeleteBanner();



  const handleDeleteClick = (banner: BannerManagement) => {
    setBannerToDelete(banner);
  };

  const handleCloseModal = () => {
    setBannerToDelete(null);
  };

  // Custom loading state with professional skeleton
  if (isLoading) {
    return (
      <TableCard.Root className="w-full overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
        <Table aria-label="Bannerlar yuklanmoqda" selectionMode="none">
          <Table.Header>
            <Table.Head id="banner" label="Banner" isRowHeader className="min-w-[360px]" />
            <Table.Head id="scope" label="Qamrov" className="w-[160px]" />
            <Table.Head id="status" label="Holat" className="w-[140px]" />
            <Table.Head id="active" label="Faollik" className="w-[120px]" />
            <Table.Head id="order" label="Tartib" className="w-[100px]" />
            <Table.Head id="schedule" label="Jadval" className="w-[180px]" />
            <Table.Head id="actions" label="" className="w-[120px]" />
          </Table.Header>
          <Table.Body items={[]}>
            {() => null}
          </Table.Body>
        </Table>
        {/* Professional banner skeletons */}
        <div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <BannerRowSkeleton key={idx} />
          ))}
        </div>
      </TableCard.Root>
    );
  }

  // Empty state
  if (!data?.results?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-secondary">
          <Image01 className="size-7 text-tertiary" />
        </div>
        <h3 className="text-base font-semibold text-primary">Bannerlar yo'q</h3>
        <p className="mt-1 max-w-sm text-sm text-tertiary">Birinchi banner yarating</p>
      </div>
    );
  }

  return (
    <TableCard.Root className="w-full overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
      <Table aria-label="Bannerlar jadvali" selectionMode="none">
        <Table.Header>
          <Table.Head id="banner" label="Banner" isRowHeader className="min-w-[360px]" />
          <Table.Head id="scope" label="Qamrov" className="w-[160px]" />
          <Table.Head id="status" label="Holat" className="w-[140px]" />
          <Table.Head id="active" label="Faollik" className="w-[120px]" />
          <Table.Head id="order" label="Tartib" className="w-[100px]" />
          <Table.Head id="schedule" label="Jadval" className="w-[180px]" />
          <Table.Head id="actions" label="" className="w-[120px]" />
        </Table.Header>
        <Table.Body items={data.results}>
          {(banner) => (
            <Table.Row id={banner.public_id} className="odd:bg-secondary_subtle">
              {/* Banner Preview */}
              <Table.Cell>
                <div className="flex items-center gap-3">
                  {banner.image && banner.image.trim() !== '' ? (
                    <BannerImage
                      src={toHttps(banner.image)!}
                      alt={banner.title}
                    />
                  ) : (
                    <div className="relative w-32 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                      <svg className="size-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="truncate text-sm text-tertiary">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
              </Table.Cell>

              {/* Scope */}
              <Table.Cell>
                <div className="flex flex-col gap-1">
                  <Badge
                    color={banner.scope === 'GLOBAL' ? 'purple' : 'blue'}
                    size="sm"
                    type="pill-color"
                  >
                    {banner.scope === 'GLOBAL' ? 'Global' : 'Universitet'}
                  </Badge>
                  {banner.university_name && (
                    <span className="text-xs text-tertiary truncate max-w-[160px]">
                      {banner.university_name}
                    </span>
                  )}
                </div>
              </Table.Cell>

              {/* Status */}
              <Table.Cell>
                <Badge
                  color={
                    banner.status === 'PUBLISHED' ? 'success' :
                    banner.status === 'DRAFT' ? 'warning' : 'error'
                  }
                  size="sm"
                  type="pill-color"
                >
                  {STATUS_LABELS[banner.status as keyof typeof STATUS_LABELS]}
                </Badge>
              </Table.Cell>

              {/* is_active */}
              <Table.Cell>
                <Badge
                  color={banner.is_active ? 'success' : 'error'}
                  size="sm"
                  type="pill-color"
                >
                  {banner.is_active ? 'Faol' : 'Nofaol'}
                </Badge>
              </Table.Cell>

              {/* Display Order */}
              <Table.Cell>
                <span className="text-sm font-medium text-secondary">{banner.display_order}</span>
              </Table.Cell>

              {/* Schedule */}
              <Table.Cell>
                {banner.start_at || banner.end_at ? (
                  <div className="text-xs text-tertiary">
                    {banner.start_at && (
                      <p className="truncate">
                        Bosh: {formatDate(banner.start_at)}
                      </p>
                    )}
                    {banner.end_at && (
                      <p className="truncate">
                        Tugash: {formatDate(banner.end_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-tertiary italic">—</span>
                )}
              </Table.Cell>

              {/* Actions */}
              <Table.Cell className="py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    color="tertiary"
                    size="sm"
                    iconLeading={Edit05}
                    onClick={() => router.push(`/banners/edit/${banner.public_id}`)}
                    aria-label="Tahrirlash"
                  />
                  <Button
                    color="tertiary-destructive"
                    size="sm"
                    iconLeading={Trash01}
                    onClick={() => handleDeleteClick(banner)}
                    aria-label="O'chirish"
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>

      {/* Pagination */}
      {data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-secondary px-6 py-4">
          <p className="text-sm text-tertiary">
            {(data.pagination.page - 1) * data.pagination.page_size + 1} dan{' '}
            {Math.min(data.pagination.page * data.pagination.page_size, data.pagination.total_items)} gacha,
            jami {data.pagination.total_items} ta natija
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.pagination.previous}
              className="inline-flex h-9 items-center rounded-lg bg-secondary px-4 text-sm font-medium text-tertiary transition hover:bg-secondary_hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Oldingi
            </button>
            <span className="text-sm font-medium text-primary">
              Sahifa {data.pagination.page} / {data.pagination.total_pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.total_pages, p + 1))}
              disabled={!data.pagination.next}
              className="inline-flex h-9 items-center rounded-lg bg-secondary px-4 text-sm font-medium text-tertiary transition hover:bg-secondary_hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {bannerToDelete && (
        <DeleteBannerModal
          item={bannerToDelete}
          onClose={handleCloseModal}
        />
      )}
    </TableCard.Root>
  );
}
