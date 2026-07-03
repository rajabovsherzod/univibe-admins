"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

type NProgressOptions = {
  showSpinner?: boolean;
  trickleSpeed?: number;
  minimum?: number;
  easing?: string;
  speed?: number;
  color?: string;
};

function NProgressInner({
  options,
}: {
  options?: NProgressOptions;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const color = options?.color ?? "#0072b0";

  // Inject NProgress CSS once (avoids hydration mismatch from inline <style>)
  useEffect(() => {
    const id = "nprogress-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      #nprogress { pointer-events: none; }
      #nprogress .bar {
        background: ${color};
        position: fixed;
        z-index: 1031;
        top: 0; left: 0;
        width: 100%; height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px; height: 100%;
        box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `;
    document.head.appendChild(style);
  }, [color]);

  useEffect(() => {
    NProgress.configure({
      showSpinner: options?.showSpinner ?? false,
      trickleSpeed: options?.trickleSpeed ?? 200,
      minimum: options?.minimum ?? 0.08,
      easing: options?.easing ?? "ease",
      speed: options?.speed ?? 200,
    });
  }, [options]);

  // Start on navigate, done when new page mounts
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

export function NProgressProvider({
  options,
}: {
  options?: NProgressOptions;
}) {
  return (
    <Suspense fallback={null}>
      <NProgressInner options={options} />
    </Suspense>
  );
}
