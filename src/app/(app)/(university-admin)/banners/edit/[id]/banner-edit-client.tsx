"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Image01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Button } from "@/components/base/buttons/button";
import { useBannerDetail, useUpdateBanner } from "@/hooks/api/use-banners-admin";
import type { BannerManagement } from "@/types/admins/banners";
import * as z from "zod";

import { BannerImageSection } from "../../create/BannerImageSection";
import { BannerFormFields } from "../../create/BannerFormFields";

// Validation schema
const bannerSchema = z.object({
  title: z.string().min(1, "Sarlavha majburiy"),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().url("To'g'ri URL kiriting").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  is_active: z.boolean(),
  display_order: z.number(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerEditClientProps {
  publicId: string;
  initialBanner: BannerManagement | null;
}

export default function BannerEditClient({ publicId, initialBanner }: BannerEditClientProps) {
  const router = useRouter();
  const updateMutation = useUpdateBanner();

  // Client-side fallback: fetch if SSR returned null
  const { data: clientBanner, isLoading: isClientLoading } = useBannerDetail(publicId);
  const banner = initialBanner || clientBanner;

  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const [existingDesktopUrl, setExistingDesktopUrl] = useState<string | null>(
    initialBanner?.image || null
  );
  const [existingMobileUrl, setExistingMobileUrl] = useState<string | null>(
    initialBanner?.mobile_image || null
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      title: initialBanner?.title || "",
      subtitle: initialBanner?.subtitle || "",
      cta_text: initialBanner?.cta_text || "",
      cta_link: initialBanner?.cta_link || "",
      status: initialBanner?.status || "DRAFT",
      is_active: initialBanner?.is_active ?? true,
      display_order: initialBanner?.display_order ?? 0,
      start_at: initialBanner?.start_at ? initialBanner.start_at.slice(0, 16) : "",
      end_at: initialBanner?.end_at ? initialBanner.end_at.slice(0, 16) : "",
    },
  });

  // If client-side data arrives (SSR was null), populate form
  React.useEffect(() => {
    if (!initialBanner && clientBanner) {
      reset({
        title: clientBanner.title,
        subtitle: clientBanner.subtitle || "",
        cta_text: clientBanner.cta_text || "",
        cta_link: clientBanner.cta_link || "",
        status: clientBanner.status,
        is_active: clientBanner.is_active,
        display_order: clientBanner.display_order,
        start_at: clientBanner.start_at ? clientBanner.start_at.slice(0, 16) : "",
        end_at: clientBanner.end_at ? clientBanner.end_at.slice(0, 16) : "",
      });
      if (clientBanner.image) setExistingDesktopUrl(clientBanner.image);
      if (clientBanner.mobile_image) setExistingMobileUrl(clientBanner.mobile_image);
    }
  }, [initialBanner, clientBanner, reset]);

  const onSubmit = async (data: BannerFormData) => {
    try {
      const formData: any = { ...data };

      if (desktopImageFile) {
        formData.image = desktopImageFile;
      }
      
      if (mobileImageFile) {
        formData.mobile_image = mobileImageFile;
      } else if (!existingMobileUrl && banner?.mobile_image) {
        // Agar ilgarigi rasm bo'lsa-yu, hozir url qolmagan bo'lsa (o'chirilgan)
        formData.mobile_image = "";
      }

      await updateMutation.mutateAsync({
        publicId,
        data: formData,
      });
      toast.success("Banner muvaffaqiyatli yangilandi!");
      router.push("/banners");
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
  };

  const isPending = isSubmitting || updateMutation.isPending;

  // Loading state (only if SSR returned null and client is still loading)
  if (!banner && isClientLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderPro
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Bannerlar", href: "/banners" },
            { label: "Tahrirlash" },
          ]}
          title="Banner tahrirlash"
          subtitle="Ma'lumotlar yuklanmoqda..."
          icon={Image01}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="overflow-hidden rounded-2xl ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Desktop rasm</h2>
              </div>
              <div className="p-6">
                <div className="h-48 rounded-xl bg-secondary skeleton-shimmer" />
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Mobile rasm (ixtiyoriy)</h2>
              </div>
              <div className="p-6">
                <div className="h-48 rounded-xl bg-secondary skeleton-shimmer" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Asosiy ma&apos;lumotlar</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-12 rounded bg-secondary skeleton-shimmer" />
                    <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 rounded bg-secondary skeleton-shimmer" />
                    <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-16 rounded bg-secondary skeleton-shimmer" />
                    <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 rounded bg-secondary skeleton-shimmer" />
                    <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                  </div>
                </div>
                <div className="h-14 rounded-lg bg-secondary skeleton-shimmer" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                  <div className="h-10 rounded-lg bg-secondary skeleton-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!banner) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderPro
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Bannerlar", href: "/banners" },
            { label: "Topilmadi" },
          ]}
          title="Banner topilmadi"
          subtitle="Bu banner mavjud emas yoki o'chirilgan"
          icon={Image01}
        />
        <div className="flex justify-start">
          <Button
            color="secondary"
            size="md"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
          >
            Orqaga
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bannerlar", href: "/banners" },
          { label: "Tahrirlash" },
        ]}
        title="Banner tahrirlash"
        subtitle={`"${banner.title}" bannerini tahrirlash`}
        icon={Image01}
      />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Image uploads with crop */}
          <div className="lg:col-span-1 space-y-6">
            <BannerImageSection
              title="Desktop rasm"
              aspectRatio={3.2 / 1}
              targetSize={{ width: 1920, height: 600 }}
              preview={desktopPreview}
              existingImageUrl={existingDesktopUrl}
              onChange={(file, previewUrl) => {
                setDesktopImageFile(file);
                if (previewUrl) {
                  setDesktopPreview(previewUrl);
                  setExistingDesktopUrl(null);
                } else {
                  setDesktopPreview(null);
                  setExistingDesktopUrl(null);
                }
              }}
            />

            <BannerImageSection
              title="Mobile rasm (ixtiyoriy)"
              aspectRatio={1.6 / 1}
              targetSize={{ width: 640, height: 400 }}
              preview={mobilePreview}
              existingImageUrl={existingMobileUrl}
              onChange={(file, previewUrl) => {
                setMobileImageFile(file);
                if (previewUrl) {
                  setMobilePreview(previewUrl);
                  setExistingMobileUrl(null);
                } else {
                  setMobilePreview(null);
                  setExistingMobileUrl(null);
                }
              }}
            />
          </div>

          {/* RIGHT: Main fields */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Asosiy ma&apos;lumotlar</h2>
              </div>
              <div className="p-6">
                <BannerFormFields control={control} errors={errors} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            color="secondary"
            size="md"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
            type="button"
          >
            Orqaga
          </Button>

          <div className="flex items-center gap-3">
            <Button
              color="secondary"
              size="md"
              onClick={() => router.back()}
              isDisabled={isPending}
              type="button"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              color="primary"
              size="md"
              isDisabled={isPending}
              isLoading={isPending}
            >
              Saqlash
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
