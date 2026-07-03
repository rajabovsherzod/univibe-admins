"use client";

import React from "react";
import { ImageUploadWithCrop } from "@/components/admins/banners/ImageUploadWithCrop";

interface BannerImageSectionProps {
  title: string;
  description?: string;
  aspectRatio: number;
  targetSize: { width: number; height: number };
  preview: string | null;
  onChange: (file: File | null, previewUrl?: string) => void;
  required?: boolean;
  /** Pass existing server image URL for edit mode */
  existingImageUrl?: string | null;
}

/**
 * BannerImageSection - Desktop yoki Mobile rasm yuklash uchun professional komponent
 */
export function BannerImageSection({
  title,
  description,
  aspectRatio,
  targetSize,
  preview,
  onChange,
  required = false,
  existingImageUrl,
}: BannerImageSectionProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
      <div className="bg-brand-solid px-5 py-3.5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">
        <ImageUploadWithCrop
          label={description || title}
          aspectRatio={aspectRatio}
          targetSize={targetSize}
          value={preview}
          onChange={onChange}
          required={required}
          existingImageUrl={existingImageUrl}
        />
      </div>
    </div>
  );
}
