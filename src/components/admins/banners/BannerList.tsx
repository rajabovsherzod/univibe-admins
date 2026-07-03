'use client';

import * as React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBannersList, useDeleteBanner } from '@/hooks/api/use-banners-admin';
import type { BannerManagement } from '@/types/admins/banners';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Edit05, Trash01, Image01, Calendar, User01, Globe01, Building03 } from '@untitledui/icons';
import { toHttps } from '@/utils/cx';
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

  if (hasError || !src) {
    return (
      <div className="absolute inset-0 bg-secondary flex items-center justify-center">
        <svg className="size-12 text-tertiary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 hover:scale-105"
      onError={() => setHasError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// Professional Banner Row Skeleton
function BannerCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-primary shadow-sm ring-1 ring-secondary overflow-hidden">
      <div className="aspect-[3.2/1] w-full bg-secondary skeleton-shimmer" />
      <div className="p-5 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-secondary skeleton-shimmer" />
          <div className="h-4 w-1/2 rounded bg-secondary skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-secondary skeleton-shimmer" />
          <div className="h-6 w-24 rounded-full bg-secondary skeleton-shimmer" />
        </div>
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-secondary">
          <div className="h-8 w-24 rounded-lg bg-secondary skeleton-shimmer" />
          <div className="flex gap-2">
            <div className="h-9 w-9 rounded-lg bg-secondary skeleton-shimmer" />
            <div className="h-9 w-9 rounded-lg bg-secondary skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BannerList() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [bannerToDelete, setBannerToDelete] = React.useState<BannerManagement | null>(null);
  
  const { data, isLoading } = useBannersList(page, pageSize);

  const handleDeleteClick = (banner: BannerManagement) => {
    setBannerToDelete(banner);
  };

  const handleCloseModal = () => {
    setBannerToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <BannerCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!data?.results?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-secondary">
          <Image01 className="size-8 text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Bannerlar yo'q</h3>
        <p className="mt-2 max-w-sm text-sm text-tertiary">Sizda hozircha hech qanday banner mavjud emas. Yangi banner qo'shish uchun yuqoridagi tugmani bosing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data.results.map((banner) => (
          <div 
            key={banner.public_id} 
            className="group flex flex-col rounded-2xl bg-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] transition-shadow ring-1 ring-secondary overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative aspect-[3.2/1] w-full bg-secondary overflow-hidden">
              <BannerImage 
                src={toHttps(banner.image) || ''} 
                alt={banner.title} 
              />
              
              <div className="absolute top-3 right-3">
                <Badge color="gray" size="sm" className="shadow-md font-mono font-semibold">
                  #{banner.display_order}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-5">
              {/* Header: Badges and Actions */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-white shadow-sm ${
                      banner.status === 'PUBLISHED' ? 'bg-utility-success-600' :
                      banner.status === 'DRAFT' ? 'bg-utility-warning-600' : 'bg-utility-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[banner.status as keyof typeof STATUS_LABELS]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-white shadow-sm ${
                      banner.is_active ? 'bg-utility-brand-600' : 'bg-utility-error-600'
                    }`}
                  >
                    {banner.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {banner.can_manage && (
                    <button
                      onClick={() => router.push(`/banners/edit/${banner.public_id}`)}
                      className="p-1.5 text-brand-600 hover:bg-secondary_hover rounded-lg transition-colors outline-none focus:ring-2 focus:ring-brand-500/50"
                      aria-label="Tahrirlash"
                      title="Tahrirlash"
                    >
                      <Edit05 className="size-5" />
                    </button>
                  )}
                  {banner.can_manage && (
                    <button
                      onClick={() => handleDeleteClick(banner)}
                      className="p-1.5 text-error-600 hover:bg-secondary_hover rounded-lg transition-colors outline-none focus:ring-2 focus:ring-error-500/50"
                      aria-label="O'chirish"
                      title="O'chirish"
                    >
                      <Trash01 className="size-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 pr-12">
                <h3 className="text-lg font-bold text-primary line-clamp-1 mb-1 group-hover:text-brand-600 transition-colors">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-sm text-tertiary line-clamp-2 min-h-[40px]">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {/* Metadata Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-secondary mt-auto bg-secondary_subtle p-3.5 rounded-xl border border-secondary">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-tertiary uppercase tracking-wider">Qamrov</span>
                  <span className="font-medium text-primary truncate" title={banner.scope === 'GLOBAL' ? 'Global (Barcha uchun)' : `Universitet: ${banner.university_name}`}>
                    {banner.scope === 'GLOBAL' ? 'Global' : banner.university_name}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-xs text-tertiary uppercase tracking-wider">Yaratuvchi</span>
                  <span className="font-medium text-primary truncate">
                    {banner.created_by_name || "Noma'lum"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <span className="font-semibold text-xs text-tertiary uppercase tracking-wider">Muddati</span>
                  <span className="font-medium text-primary">
                    {banner.start_at || banner.end_at ? (
                      <>
                        {banner.start_at ? formatDate(banner.start_at) : '...'} 
                        {' - '}
                        {banner.end_at ? formatDate(banner.end_at) : '...'}
                      </>
                    ) : (
                      'Muddati belgilanmagan'
                    )}
                  </span>
                </div>
                
                {/* CTA URL */}
                {(banner.cta_text || banner.cta_link) && (
                  <div className="flex flex-col gap-1 col-span-2 pt-3 border-t border-secondary/50">
                    <span className="font-semibold text-xs text-tertiary uppercase tracking-wider">Havola (Tugma: {banner.cta_text || 'Yo\'q'})</span>
                    <div className="flex items-center min-w-0">
                      {banner.cta_link ? (
                        <a 
                          href={banner.cta_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-brand-600 hover:text-brand-700 truncate"
                        >
                          {banner.cta_link}
                        </a>
                      ) : (
                        <span className="text-tertiary italic">Havola biriktirilmagan</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-primary px-5 py-3 shadow-sm ring-1 ring-secondary mt-6">
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
            <span className="text-sm font-medium text-primary bg-secondary/50 px-3 py-1.5 rounded-md">
              {data.pagination.page} / {data.pagination.total_pages}
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
    </div>
  );
}
