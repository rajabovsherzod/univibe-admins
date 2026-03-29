"use client";

import { useState, useRef, useCallback } from 'react';
import { ImageCropModal } from './ImageCropModal';
import { Edit05 } from '@untitledui/icons';
import type { Point } from 'react-easy-crop';

interface ImageUploadWithCropProps {
  label: string;
  aspectRatio: number;
  targetSize: { width: number; height: number };
  value?: string | null;
  onChange: (file: File | null, previewUrl?: string) => void;
  required?: boolean;
  /** For edit mode — pass an existing server image URL */
  existingImageUrl?: string | null;
}

/**
 * ImageUploadWithCrop - Drag & Drop + Telegram style crop
 * 
 * Features:
 * - Drag & drop upload
 * - Instant crop modal on file select
 * - Click preview to re-crop with PREVIOUS crop state preserved
 * - Remove button
 * - Supports existing server images for edit mode
 */
export function ImageUploadWithCrop({
  label,
  aspectRatio,
  targetSize,
  value,
  onChange,
  required,
  existingImageUrl,
}: ImageUploadWithCropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);

  // Persist last crop/zoom state for re-editing
  const [lastCrop, setLastCrop] = useState<Point>({ x: 0, y: 0 });
  const [lastZoom, setLastZoom] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection — opens crop modal with fresh state
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayllarini yuklash mumkin!');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setOriginalImageFile(file);
    setSelectedImage(previewUrl);
    // Reset crop state for new images
    setLastCrop({ x: 0, y: 0 });
    setLastZoom(1);
    setCropModalOpen(true);
  }, []);

  // Handle crop complete — persists crop state
  const handleCropComplete = useCallback(async (croppedBlob: Blob, crop: Point, zoom: number) => {
    const file = new File([croppedBlob], `banner-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    const previewUrl = URL.createObjectURL(croppedBlob);

    // Persist crop state
    setLastCrop(crop);
    setLastZoom(zoom);

    // Pass cropped file + preview to parent
    onChange(file, previewUrl);

    // Close modal
    setCropModalOpen(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    // Keep originalImageFile for re-crop
  }, [onChange, selectedImage]);

  // Drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset to allow re-selecting same file
    if (e.target) e.target.value = '';
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    onChange(null);
    if (value) {
      URL.revokeObjectURL(value);
    }
    setOriginalImageFile(null);
    setLastCrop({ x: 0, y: 0 });
    setLastZoom(1);
  }, [onChange, value]);

  // Handle click on preview to re-crop with PREVIOUS crop state
  const handlePreviewClick = useCallback(() => {
    if (originalImageFile) {
      // Re-open crop with the original file and last crop state
      const previewUrl = URL.createObjectURL(originalImageFile);
      setSelectedImage(previewUrl);
      setCropModalOpen(true);
    } else if (existingImageUrl) {
      // Edit mode: use existing server image for cropping
      setSelectedImage(existingImageUrl);
      setCropModalOpen(true);
    } else if (value) {
      // Fallback
      setSelectedImage(value);
      setCropModalOpen(true);
    }
  }, [originalImageFile, existingImageUrl, value]);

  const previewSrc = value || existingImageUrl;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-fg-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-fg-tertiary">
          {targetSize.width} × {targetSize.height}px ({aspectRatio.toFixed(1)}:1)
        </span>
      </div>

      {/* Upload Area */}
      {previewSrc ? (
        // Preview with click to re-crop
        <div className="relative rounded-xl overflow-hidden border-2 border-border-secondary bg-bg-secondary group">
          <div className="w-full h-48 overflow-hidden cursor-pointer" onClick={handlePreviewClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute top-2 right-2 size-9 flex items-center justify-center bg-error-600 hover:bg-error-700 text-white rounded-lg transition-colors shadow-lg"
            title="O'chirish"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Hover hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <p className="flex items-center gap-2 text-sm font-medium text-fg-primary">
                <Edit05 className="w-4 h-4" /> Tahrirlash uchun bosing
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Drop Zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative flex flex-col items-center justify-center h-48 p-4 border-2 border-dashed rounded-xl text-center cursor-pointer
            transition-all duration-200 ease-in-out

            ${isDragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
              : 'border-border-secondary hover:border-brand-400 hover:bg-bg-tertiary'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="size-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-fg-primary">
                Rasmni shu yerga tashlang yoki bosing
              </p>
              <p className="text-xs text-fg-tertiary mt-1">
                PNG, JPG, WebP • Tavsiya: {targetSize.width}×{targetSize.height}px
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && selectedImage && (
        <ImageCropModal
          image={selectedImage}
          aspectRatio={aspectRatio}
          initialCrop={lastCrop}
          initialZoom={lastZoom}
          onClose={() => {
            setCropModalOpen(false);
            if (selectedImage && !selectedImage.startsWith('http')) {
              URL.revokeObjectURL(selectedImage);
            }
            setSelectedImage(null);
          }}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
