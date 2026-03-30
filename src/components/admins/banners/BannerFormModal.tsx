'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImageUploadWithCrop } from './ImageUploadWithCrop';
import { useCreateBanner, useUpdateBanner } from '@/hooks/api/use-banners-admin';
import type { BannerManagement, CreateBannerInput, UpdateBannerInput } from '@/types/admins/banners';

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: BannerManagement | null;
}

/**
 * Desktop: 1920 × 600 (3.2:1)
 * Mobile: 640 × 400 (1.6:1)
 */
const DESKTOP_ASPECT_RATIO = 3.2;
const MOBILE_ASPECT_RATIO = 1.6;
const DESKTOP_SIZE = { width: 1920, height: 600 };
const MOBILE_SIZE = { width: 640, height: 400 };

export function BannerFormModal({ isOpen, onClose, banner }: BannerFormModalProps) {
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | undefined>(banner?.image);
  const [mobilePreview, setMobilePreview] = useState<string | undefined>(banner?.mobile_image || undefined);

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBannerInput & UpdateBannerInput>({
    defaultValues: banner ? {
      title: banner.title,
      subtitle: banner.subtitle || '',
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      scope: banner.scope,
      university_name: banner.university_name || '',
      status: banner.status,
      is_active: banner.is_active,
      display_order: banner.display_order,
      start_at: banner.start_at || '',
      end_at: banner.end_at || '',
    } : {
      title: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      scope: 'UNIVERSITY',
      university_name: '',
      status: 'DRAFT',
      is_active: true,
      display_order: 0,
      start_at: '',
      end_at: '',
    },
  });

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle || '',
        cta_text: banner.cta_text || '',
        cta_link: banner.cta_link || '',
        scope: banner.scope,
        university_name: banner.university_name || '',
        status: banner.status,
        is_active: banner.is_active,
        display_order: banner.display_order,
        start_at: banner.start_at || '',
        end_at: banner.end_at || '',
      });
      setDesktopPreview(banner.image);
      setMobilePreview(banner.mobile_image || undefined);
    } else {
      reset({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        scope: 'UNIVERSITY',
        university_name: '',
        status: 'DRAFT',
        is_active: true,
        display_order: 0,
        start_at: '',
        end_at: '',
      });
      setDesktopPreview(undefined);
      setMobilePreview(undefined);
    }
  }, [banner, reset]);

  const onSubmit = async (data: any) => {
    // Desktop image required
    if (!desktopImageFile && !banner?.image) {
      alert('Desktop rasm majburiy!');
      return;
    }

    try {
      if (banner) {
        // Update
        const updateData: UpdateBannerInput = {
          title: data.title,
          subtitle: data.subtitle || undefined,
          cta_text: data.cta_text || undefined,
          cta_link: data.cta_link || undefined,
          scope: data.scope as 'GLOBAL' | 'UNIVERSITY',
          university_name: data.university_name || undefined,
          status: data.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
          is_active: data.is_active,
          display_order: data.display_order,
          start_at: data.start_at || undefined,
          end_at: data.end_at || undefined,
          ...(desktopImageFile && { image: desktopImageFile }),
          ...(mobileImageFile !== null && { mobile_image: mobileImageFile }),
        };

        await updateMutation.mutateAsync({
          publicId: banner.public_id,
          data: updateData,
        });
      } else {
        // Create
        const createData: CreateBannerInput = {
          title: data.title,
          subtitle: data.subtitle || undefined,
          cta_text: data.cta_text || undefined,
          cta_link: data.cta_link || undefined,
          scope: data.scope as 'GLOBAL' | 'UNIVERSITY',
          university_name: data.university_name || undefined,
          status: data.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
          is_active: data.is_active,
          display_order: data.display_order,
          start_at: data.start_at || undefined,
          end_at: data.end_at || undefined,
          image: desktopImageFile!,
          mobile_image: mobileImageFile || null,
        };

        await createMutation.mutateAsync(createData);
      }

      // Close modal and cleanup
      handleClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Banner saqlashda xatolik!');
    }
  };

  const handleClose = () => {
    reset();
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setDesktopPreview(undefined);
    setMobilePreview(undefined);
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-primary rounded-2xl p-6 w-full max-w-4xl mx-4 my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-fg-primary">
              {banner ? 'Bannerni Tahrirlash' : 'Yangi Banner Yaratish'}
            </h2>
            <p className="text-sm text-fg-tertiary">
              Barcha maydonlarni to'ldiring va rasmlarni yuklang
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-fg-tertiary hover:text-fg-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title majburiy' })}
                className="w-full input"
                placeholder="Masalan: Navruz Bayrami!"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Subtitle
              </label>
              <textarea
                {...register('subtitle')}
                className="w-full input"
                rows={2}
                placeholder="Qisqacha tavsif..."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                CTA Text
              </label>
              <input
                {...register('cta_text')}
                className="w-full input"
                placeholder="Masalan: Batafsil"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                CTA Link
              </label>
              <input
                {...register('cta_link')}
                className="w-full input"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Images with Crop */}
          <div className="grid grid-cols-2 gap-4">
            {/* Desktop Image */}
            <div>
              <ImageUploadWithCrop
                label="Desktop Rasm"
                aspectRatio={DESKTOP_ASPECT_RATIO}
                targetSize={DESKTOP_SIZE}
                value={desktopPreview}
                onChange={(file, preview) => {
                  setDesktopImageFile(file);
                  if (preview) setDesktopPreview(preview);
                }}
                required={!banner?.image}
              />
            </div>

            {/* Mobile Image */}
            <div>
              <ImageUploadWithCrop
                label="Mobile Rasm (Optional)"
                aspectRatio={MOBILE_ASPECT_RATIO}
                targetSize={MOBILE_SIZE}
                value={mobilePreview}
                onChange={(file, preview) => {
                  setMobileImageFile(file);
                  if (preview) setMobilePreview(preview);
                }}
                required={false}
              />
            </div>
          </div>

          {/* Scope & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Scope
              </label>
              <select
                {...register('scope')}
                className="w-full input"
              >
                <option value="UNIVERSITY">University</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full input"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Display Order
              </label>
              <input
                {...register('display_order', { valueAsNumber: true })}
                type="number"
                className="w-full input"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="checkbox"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-fg-primary">
                Faol
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                Start At
              </label>
              <input
                {...register('start_at')}
                type="datetime-local"
                className="w-full input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-primary mb-1">
                End At
              </label>
              <input
                {...register('end_at')}
                type="datetime-local"
                className="w-full input"
              />
            </div>
          </div>

          {/* University Name (for UNIVERSITY scope) */}
          <div>
            <label className="block text-sm font-medium text-fg-primary mb-1">
              University Name
            </label>
            <input
              {...register('university_name')}
              className="w-full input"
              placeholder="Toshkent Davlat Universiteti"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-secondary">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-fg-secondary hover:text-fg-primary transition-colors"
              disabled={isLoading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saqlanmoqda...' : (banner ? 'Yangilash' : 'Yaratish')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
