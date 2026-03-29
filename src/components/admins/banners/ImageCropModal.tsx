'use client';

import { useState, useCallback } from 'react';
import { InfoCircle } from '@untitledui/icons';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface ImageCropModalProps {
  image: string;
  aspectRatio: number;
  onClose: () => void;
  onComplete: (croppedImage: Blob, crop: Point, zoom: number) => void;
  initialCrop?: Point;
  initialZoom?: number;
}

/**
 * ImageCropModal - Telegram style image cropper
 * 
 * Features:
 * - Aspect ratio locked
 * - Pan & Zoom
 * - Real-time preview
 * - Canvas based cropping
 * - Persists crop/zoom state for re-editing
 */
export function ImageCropModal({
  image,
  aspectRatio,
  onClose,
  onComplete,
  initialCrop,
  initialZoom,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>(initialCrop ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom ?? 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Load original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = image;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      // react-easy-crop returns croppedAreaPixels in REAL pixels
      // Use them directly — no rescaling needed
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Pass back the blob AND the current crop/zoom so parent can persist them
            onComplete(blob, crop, zoom);
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [croppedAreaPixels, image, onComplete, crop, zoom]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-bg-primary rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-fg-primary">
            Rasmni kesish ({aspectRatio.toFixed(1)}:1)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-fg-tertiary hover:text-fg-primary hover:bg-bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Crop Container */}
        <div className="relative h-[500px] bg-bg-secondary rounded-xl overflow-hidden mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            objectFit="horizontal-cover"
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Zoom Slider */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Zoom: {(zoom * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          {/* Instructions */}
          <div className="bg-bg-secondary rounded-lg p-3 text-sm text-fg-tertiary">
            <p className="flex items-start gap-2">
              <InfoCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Sichqoncha bilan suring va zoom qilib kerakli joyni tanlang</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-fg-secondary hover:text-fg-primary rounded-lg hover:bg-bg-secondary transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
