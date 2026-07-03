'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAdminUpdateClub } from '@/hooks/api/use-clubs-admin';
import { CreateClubPayload, ClubDetail } from '@/types/clubs';
import { PremiumFormModal } from '@/components/application/modals/premium-modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Select } from '@/components/base/select/select';
import { ImageUploadWithCrop } from '@/components/admins/banners/ImageUploadWithCrop';
import { Edit02 } from '@untitledui/icons';

interface ClubEditModalProps {
  club: ClubDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const LOGO_ASPECT_RATIO = 1; // 1:1
const LOGO_SIZE = { width: 400, height: 400 };

const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_SIZE = { width: 1280, height: 720 };

export function ClubEditModal({ club, isOpen, onClose }: ClubEditModalProps) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<Partial<CreateClubPayload>>();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { mutate: updateClub, isPending } = useAdminUpdateClub();

  useEffect(() => {
    if (club && isOpen) {
      reset({
        name: club.name,
        slug: club.slug,
        short_description: club.short_description,
        description: club.description,
        visibility: club.visibility,
        category_id: club.category?.public_id || null,
      });
      setLogoPreview(club.logo || null);
      setBannerPreview(club.banner || null);
    }
  }, [club, isOpen, reset]);

  const handleClose = () => {
    setLogoFile(null);
    setBannerFile(null);
    onClose();
  };

  const onSubmit = (data: Partial<CreateClubPayload>) => {
    if (!club) return;
    
    const payload: Partial<CreateClubPayload> = {
      ...data,
      logo: logoFile || undefined,
      banner: bannerFile || undefined,
    };

    updateClub(
      { clubId: club.public_id, data: payload },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  if (!club) return null;

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      title="Klubni tahrirlash"
      description="Klub ma'lumotlarini o'zgartirishingiz mumkin."
      icon={Edit02}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button color="secondary" type="button" onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="club-edit-form" isLoading={isPending} isDisabled={isPending}>
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="club-edit-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        
        {/* Left Column: Data fields */}
        <div className="flex flex-col gap-5">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Klub nomi majburiy' }}
            render={({ field }) => (
              <Input
                {...field}
                label="Klub Nomi *"
                placeholder="Masalan: IT Club, English Club..."
                isInvalid={!!errors.name}
                hint={errors.name?.message}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-5">
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Slug (Ixtiyoriy)"
                  placeholder="it-club"
                  hint="Avtomatik yasalishi uchun bo'sh qoldiring."
                  isInvalid={!!errors.slug}
                />
              )}
            />
          </div>

          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <Select
                selectedKey={field.value}
                onSelectionChange={field.onChange}
                label="Ko'rinish (Visibility)"
              >
                <Select.Item id="PUBLIC" label="Ommaviy (Public)" />
                <Select.Item id="PRIVATE" label="Yopiq (Private)" />
              </Select>
            )}
          />

          <Controller
            name="short_description"
            control={control}
            rules={{ required: 'Qisqa tavsif majburiy' }}
            render={({ field }) => (
              <TextArea
                {...field}
                label="Qisqa tavsif *"
                placeholder="Klub haqida qisqacha ma'lumot (1-2 gap)..."
                isInvalid={!!errors.short_description}
                hint={errors.short_description?.message}
                rows={2}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: 'Batafsil tavsif majburiy' }}
            render={({ field }) => (
              <TextArea
                {...field}
                label="Batafsil tavsif *"
                placeholder="Klubning maqsadi, qoidalari va to'liq ma'lumoti..."
                isInvalid={!!errors.description}
                hint={errors.description?.message}
                rows={5}
              />
            )}
          />
        </div>

        {/* Right Column: Uploads */}
        <div className="flex flex-col gap-6 md:border-l md:border-secondary md:pl-8">
          <div>
            <ImageUploadWithCrop
              label="Klub Logosi"
              aspectRatio={LOGO_ASPECT_RATIO}
              targetSize={LOGO_SIZE}
              value={logoPreview}
              onChange={(file, preview) => {
                setLogoFile(file);
                if (preview) setLogoPreview(preview);
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">1:1 o'lchamda, max 2MB</p>
          </div>

          <div className="h-px w-full bg-secondary md:hidden" />

          <div>
            <ImageUploadWithCrop
              label="Klub Banneri"
              aspectRatio={BANNER_ASPECT_RATIO}
              targetSize={BANNER_SIZE}
              value={bannerPreview}
              onChange={(file, preview) => {
                setBannerFile(file);
                if (preview) setBannerPreview(preview);
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">16:9 o'lchamda, max 5MB</p>
          </div>
        </div>

      </form>
    </PremiumFormModal>
  );
}
