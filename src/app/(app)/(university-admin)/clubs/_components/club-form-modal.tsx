'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAdminCreateClub } from '@/hooks/api/use-clubs-admin';
import { CreateClubPayload, ClubVisibility } from '@/types/clubs';
import { PremiumFormModal } from '@/components/application/modals/premium-modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Select } from '@/components/base/select/select';
import { ImageUploadWithCrop } from '@/components/admins/banners/ImageUploadWithCrop';
import { Plus } from '@untitledui/icons';
import { Loader2 } from 'lucide-react';

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOGO_ASPECT_RATIO = 1; // 1:1
const LOGO_SIZE = { width: 400, height: 400 };

const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_SIZE = { width: 1280, height: 720 };

export function ClubFormModal({ isOpen, onClose }: ClubFormModalProps) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateClubPayload>({
    defaultValues: {
      visibility: 'PUBLIC',
      name: '',
      short_description: '',
      description: '',
      slug: '',
    }
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { mutate: createClub, isPending } = useAdminCreateClub();

  const handleClose = () => {
    reset();
    setLogoFile(null);
    setLogoPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    onClose();
  };

  const onSubmit = (data: CreateClubPayload) => {
    const payload: CreateClubPayload = {
      ...data,
      logo: logoFile,
      banner: bannerFile,
    };

    createClub(payload, {
      onSuccess: () => {
        handleClose();
      }
    });
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      title="Yangi klub yaratish"
      description="Klub ma'lumotlari, vizual bezaklari va ruxsatlarini sozlang."
      icon={Plus}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button color="secondary" type="button" onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="club-create-form" isLoading={isPending} isDisabled={isPending}>
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="club-create-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        
        {/* Left Column: Data fields */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Klub nomi majburiy' }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Klub nomi *"
                  placeholder="Masalan: IT Club"
                  isInvalid={!!errors.name}
                  hint={errors.name?.message}
                />
              )}
            />
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
