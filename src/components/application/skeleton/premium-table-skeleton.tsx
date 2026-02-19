"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface PremiumTableSkeletonProps {
  rows?: number;
  columns?: number;
  showPagination?: boolean;
}

export function PremiumTableSkeleton({
  rows = 5,
  columns = 5,
  showPagination = true,
}: PremiumTableSkeletonProps) {
  return (
    // 1. LIQUID CLEAR CONTAINER:
    // - bg-transparent: Asosiy fon yo'q, faqat blur bor.
    // - backdrop-blur-xl: Orqa fonni chiroyli xiralashtiradi.
    // - border-white/20 (Light) & border-white/10 (Dark): Shishaning qirrasi.
    // - shadow-sm: Yengil hajm.
    <div className="w-full relative overflow-hidden rounded-xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-xl shadow-sm">

      {/* Yaltiroq Nur (Highlight) - Yuqoridan tushayotgan yorug'lik */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 pointer-events-none" />

      <div className="relative z-10 overflow-x-auto">
        <table className="w-full caption-bottom text-sm">

          {/* 2. HEADER: 
             - Juda past opacity (5%) bilan ajratiladi.
             - Dark/Light rejimga moslashadi (foreground rangi orqali).
          */}
          <thead className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="h-12 px-4 text-left align-middle sm:px-6">
                  {/* SKELETON BAR: 
                     - Bu yerda 'bg-muted' ishlatmaymiz.
                     - 'bg-foreground/10' -> Matn rangining 10% shaffofligi.
                     - Bu Lightda qoramtir shisha, Darkda oqish shisha bo'lib ko'rinadi.
                  */}
                  <Skeleton className="h-4 w-24 rounded-md bg-foreground/10 backdrop-blur-md" />
                </th>
              ))}
            </tr>
          </thead>

          {/* 3. BODY */}
          <tbody className="[&_tr:last-child]:border-0">
            {Array.from({ length: rows }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-black/5 dark:border-white/5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-4 align-middle sm:px-6">
                    {/* Hujayra ichidagi "oyna" chiziqlar */}
                    <Skeleton
                      className={`h-4 rounded-md bg-foreground/5 ${j === 0 ? 'w-[140px]' :
                          j === columns - 1 ? 'w-[80px]' :
                            'w-full'
                        }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. PAGINATION */}
      {showPagination && (
        <div className="relative z-10 flex items-center justify-between border-t border-black/5 dark:border-white/5 px-4 py-4 sm:px-6 bg-black/5 dark:bg-white/5">
          {/* Chap tomon */}
          <Skeleton className="h-4 w-[180px] rounded-md bg-foreground/10" />

          {/* O'ng tomon */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20 rounded-lg bg-foreground/5 border border-black/5 dark:border-white/5" />
            <Skeleton className="h-9 w-20 rounded-lg bg-foreground/5 border border-black/5 dark:border-white/5" />
          </div>
        </div>
      )}
    </div>
  );
}
