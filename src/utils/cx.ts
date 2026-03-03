import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Untitled starterda bu helper "sizes" mappinglarni tuzishda ishlatiladi.
 * Hozircha identity bo'lsa ham yetarli (build xatoni to'xtatadi).
 */
export function sortCx<T extends Record<string, any>>(obj: T): T {
  return obj;
}

/**
 * Proxy backend image URLs through /api/image route.
 * This solves all production issues:
 *   - Mixed content (http vs https)
 *   - Backend not directly accessible from browser
 *   - Any Django media URL format (absolute, relative, http, localhost)
 */
export function toHttps(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return `/api/image?url=${encodeURIComponent(url)}`;
}
