'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useBanners } from '@/hooks/api/use-banners';
import { BannerCard } from './BannerCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

/**
 * BannersSlider - Admin/Staff dashboard uchun banner slider
 * 
 * Features:
 * - Auto-play every 5 seconds
 * - Pagination dots (bottom center)
 * - Fade effect between slides
 * - Loading skeleton
 * - Empty state handling
 */
export function BannersSliderAdmin() {
  const { data, isLoading } = useBanners();
  
  // Loading state - show professional skeleton
  if (isLoading) {
    return (
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] bg-bg-secondary rounded-xl mb-6 overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 skeleton-shimmer" />
        
        {/* Dark Overlay (matches real banner) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/20" />
        
        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex flex-col items-start gap-2 sm:gap-3 z-10">
          {/* Title skeleton */}
          <div className="h-8 sm:h-10 md:h-12 w-3/4 sm:w-1/2 bg-white/20 rounded skeleton-shimmer" />
          
          {/* Subtitle skeleton */}
          <div className="h-4 sm:h-5 md:h-6 w-3/4 sm:w-2/3 bg-white/20 rounded skeleton-shimmer mt-1" />
          
          {/* Button skeleton */}
          <div className="h-10 sm:h-11 w-32 sm:w-40 bg-brand-600/50 rounded-lg skeleton-shimmer mt-2 sm:mt-3" />
        </div>
      </div>
    );
  }
  
  // No banners - hide component but show placeholder
  if (!data?.results?.length) {
    return (
      <div className="w-full h-[200px] sm:h-[300px] md:h-[350px] bg-bg-secondary rounded-xl mb-6 flex items-center justify-center text-fg-tertiary text-sm">
        Hozircha bannerlar yo'q
      </div>
    );
  }
  
  return (
    <div className="w-full mb-6">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={500}
        className="mySwiper"
      >
        {data.results.map((banner) => (
          <SwiperSlide key={banner.public_id}>
            <BannerCard banner={banner} isMobile={false} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
