'use client';

import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { BannerList } from '@/components/admins/banners/BannerList';
import { BannersSliderAdmin } from '@/components/admins/banners/BannersSliderAdmin';
import { Image01 } from '@untitledui/icons';
import Link from 'next/link';

export default function BannersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeaderPro
        breadcrumbs={[{ label: 'Bannerlar' }]}
        title="Bannerlar"
        subtitle="Universitet bannerlarini boshqaring"
        icon={Image01}
      />
      
      {/* Preview Slider */}
      <div className="bg-bg-primary rounded-xl p-4 border border-border-secondary">
        <h3 className="text-sm font-semibold text-fg-primary mb-3">Dashboard Ko'rinishi</h3>
        <BannersSliderAdmin />
      </div>
      
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-fg-tertiary">
            Universitetingiz uchun bannerlar yarating va boshqaring
          </p>
        </div>
        <Link href="/banners/create" className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-solid_hover">
          Banner Yaratish
        </Link>
      </div>
      
      {/* Banner List */}
      <BannerList />
    </div>
  );
}
