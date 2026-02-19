// app/(app)/_components/sidebar/mobile-header.tsx
// 1:1 copy of pro-project MobileHeader
"use client";

import Image from "next/image";
import { Menu01 } from "@untitledui/icons";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-secondary bg-primary/95 px-4 backdrop-blur-md md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Image
          src="/brand-light-logo.svg"
          alt="Univibe"
          width={32}
          height={32}
          className="h-8 w-auto dark:hidden"
          unoptimized
        />
        <Image
          src="/brand-dark-logo.png"
          alt="Univibe"
          width={32}
          height={32}
          className="h-8 w-auto hidden dark:block"
          unoptimized
        />
        <span className="text-lg font-bold tracking-tight text-brand-solid">
          Univibe
        </span>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={onMenuClick}
        className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary active:bg-tertiary"
        aria-label="Menyuni ochish"
      >
        <Menu01 className="size-6 text-secondary" />
      </button>
    </header>
  );
}
