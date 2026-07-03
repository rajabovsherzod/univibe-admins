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
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] bg-primary border border-secondary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] rounded-2xl mb-6 p-4 sm:p-6 md:p-8 flex flex-col justify-end">
        <div className="absolute inset-0 skeleton-shimmer opacity-20" />
        {/* Content Skeleton */}
        <div className="flex flex-col items-start gap-2 sm:gap-3 w-full relative z-10">
          {/* Title skeleton */}
          <div className="h-8 sm:h-10 md:h-12 w-3/4 sm:w-1/2 rounded-lg skeleton-shimmer" />
          
          {/* Subtitle skeleton */}
          <div className="h-4 sm:h-5 md:h-6 w-2/3 sm:w-1/2 rounded-md skeleton-shimmer mt-1" />
          
          {/* Button skeleton */}
          <div className="h-10 sm:h-11 w-32 sm:w-40 rounded-xl skeleton-shimmer mt-2 sm:mt-3" />
        </div>
      </div>
    );
  }
  
  if (!data?.results?.length) {
    return (
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-[350px] bg-primary border border-secondary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] rounded-2xl mb-6 flex flex-col items-center justify-center text-center p-6">
        <div className="mb-4">
          <img src="/svgs/no-data.svg" alt="No data" className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-1">Hozircha bannerlar mavjud emas</h3>
        <p className="text-sm text-tertiary max-w-md mx-auto">
          Universitet hayotiga oid muhim e'lon va yangiliklarni yetkazish uchun yangi banner qo'shing.
        </p>
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
