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

/** Normalize backend image URLs: replace http:// → https:// to prevent mixed-content blocking on HTTPS (Vercel). */
export function toHttps(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http://") ? "https://" + url.slice(7) : url;
}
