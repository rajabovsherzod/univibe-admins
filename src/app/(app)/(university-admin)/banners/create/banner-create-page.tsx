"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Image01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Button } from "@/components/base/buttons/button";
import { useCreateBanner } from "@/hooks/api/use-banners-admin";
import * as z from "zod";

import { BannerImageSection } from "./BannerImageSection";
import { BannerFormFields } from "./BannerFormFields";

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

export default function BannerCreatePage() {
  const router = useRouter();
  const createMutation = useCreateBanner();
  
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      title: "",
      subtitle: "",
      cta_text: "",
      cta_link: "",
      status: "DRAFT",
      is_active: true,
      display_order: 0,
      start_at: "",
      end_at: "",
    },
  });

  const onSubmit = async (data: BannerFormData) => {
    try {
      if (!desktopImageFile) {
        toast.error("Rasm yuklash majburiy");
        return;
      }

      const formData: any = {
        ...data,
        scope: "UNIVERSITY" as const,
        image: desktopImageFile,
      };

      if (mobileImageFile) {
        formData.mobile_image = mobileImageFile;
      }

      await createMutation.mutateAsync(formData);
      toast.success("Banner muvaffaqiyatli yaratildi!");
      router.push("/banners");
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
  };

  const isPending = isSubmitting || createMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bannerlar", href: "/banners" },
          { label: "Yangi banner" },
        ]}
        title="Yangi banner yaratish"
        subtitle="Universitet uchun yangi banner yarating"
        icon={Image01}
      />

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Image uploads with crop */}
          <div className="lg:col-span-1 space-y-6">
            {/* Desktop Image - 1920x600 (3.2:1) */}
            <BannerImageSection
              title="Desktop rasm"
              aspectRatio={3.2 / 1}
              targetSize={{ width: 1920, height: 600 }}
              preview={desktopPreview}
              onChange={(file, previewUrl) => {
                setDesktopImageFile(file);
                if (previewUrl) {
                  setDesktopPreview(previewUrl);
                } else {
                  setDesktopPreview(null);
                }
              }}
              required
            />

            {/* Mobile Image - 640x400 (1.6:1) */}
            <BannerImageSection
              title="Mobile rasm (ixtiyoriy)"
              aspectRatio={1.6 / 1}
              targetSize={{ width: 640, height: 400 }}
              preview={mobilePreview}
              onChange={(file, previewUrl) => {
                setMobileImageFile(file);
                if (previewUrl) {
                  setMobilePreview(previewUrl);
                } else {
                  setMobilePreview(null);
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
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            size="md"
            color="secondary"
            onClick={() => router.back()}
            disabled={isPending}
            type="button"
          >
            Bekor qilish
          </Button>
          <Button
            size="md"
            color="primary"
            type="submit"
            disabled={isPending}
            isLoading={isPending}
          >
            Saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}
