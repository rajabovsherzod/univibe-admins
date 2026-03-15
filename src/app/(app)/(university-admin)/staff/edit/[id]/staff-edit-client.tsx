"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, User01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { updateStaffSchema, type UpdateStaffInput } from "@/lib/validations/staff";
import { useUpdateStaffProfile } from "@/hooks/api/use-staff";
import Image from "next/image";

interface StaffEditPageClientProps {
  staffData: {
    user_public_id: string;
    name: string;
    surname: string;
    email: string;
    job_position_public_id: string;
    profile_photo_url: string | null;
    full_name: string;
  };
  jobPositions: Array<{
    public_id: string;
    name: string;
  }>;
}

export default function StaffEditPageClient({ staffData, jobPositions }: StaffEditPageClientProps) {
  const router = useRouter();
  const updateStaff = useUpdateStaffProfile();
  const [photoPreview, setPhotoPreview] = useState<string | null>(staffData.profile_photo_url || null);
  const initialPhotoUrl = staffData.profile_photo_url || null;

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema) as any,
    defaultValues: {
      name: staffData.name,
      surname: staffData.surname,
      job_position_public_id: staffData.job_position_public_id,
      profile_photo: null,
    },
  });

  const selectedJobId = watch("job_position_public_id");
  const jobPositionItems = jobPositions.map((p) => ({ id: p.public_id, label: p.name }));

  const onSubmit = async (data: UpdateStaffInput) => {
    try {
      await updateStaff.mutateAsync({ ...data, user_public_id: staffData.user_public_id });
      toast.success("Xodim ma'lumotlari muvaffaqiyatli yangilandi!");
      router.push("/staff");
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
  };

  const isPending = isSubmitting || updateStaff.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Xodimlar", href: "/staff" },
          { label: "Tahrirlash" },
        ]}
        title="Xodimni tahrirlash"
        subtitle="Xodim ma'lumotlarini o'zgartiring. * bilan belgilangan maydonlar majburiy."
        icon={User01}
      />

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LEFT: Photo upload */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Profil rasmi</h2>
              </div>
              <div className="flex flex-col gap-4 p-6">
                <FileUpload.Root>
                  <FileUpload.DropZone
                    accept="image/png, image/jpeg, image/webp"
                    allowsMultiple={false}
                    maxSize={5 * 1024 * 1024} // 5 MB
                    onDropFiles={(files: FileList | File[]) => {
                      const file = files[0];
                      if (!file) return;
                      setValue("profile_photo", file as any, { shouldValidate: true });
                      setPhotoPreview(URL.createObjectURL(file));
                    }}
                    onSizeLimitExceed={() => toast.error("Kechirasiz, rasm hajmi 5 MB dan oshmasligi kerak")}
                    hint="PNG, JPG yoki WebP (Maks. 5 MB)"
                  />

                  {watch("profile_photo") && (
                    <FileUpload.List>
                      <FileUpload.ListItemProgressBar
                        name={(watch("profile_photo") as any)?.name || "Rasm"}
                        size={(watch("profile_photo") as void | any)?.size || 0}
                        progress={100}
                        onDelete={() => {
                          setValue("profile_photo", null, { shouldValidate: true });
                          setPhotoPreview(initialPhotoUrl);
                        }}
                      />
                    </FileUpload.List>
                  )}

                  {/* Profile preview */}
                  {photoPreview && (
                    <div className="mx-auto mt-2 flex size-32 items-center justify-center overflow-hidden rounded-full bg-secondary ring-4 ring-brand-solid/20">
                      <Image src={photoPreview} alt="Preview" width={128} height={128} className="size-full object-cover" unoptimized />
                    </div>
                  )}
                </FileUpload.Root>
              </div>
            </div>
          </div>

          {/* RIGHT: Main fields */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Asosiy ma&apos;lumotlar</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Name */}
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        label="Ism"
                        placeholder="Azizbek"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.name}
                        hint={errors.name?.message}
                        isRequired
                      />
                    )}
                  />

                  {/* Surname */}
                  <Controller
                    control={control}
                    name="surname"
                    render={({ field }) => (
                      <Input
                        label="Familiya"
                        placeholder="Rahimov"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.surname}
                        hint={errors.surname?.message}
                        isRequired
                      />
                    )}
                  />

                  {/* Email - Read only */}
                  <Input
                    label="Email (o'zgartirib bo'lmaydi)"
                    type="email"
                    value={staffData.email}
                    isDisabled
                    placeholder="azizbek@univibe.uz"
                  />

                  {/* Job position — UntitledUI Select */}
                  <Select
                    id="job_position"
                    label="Lavozim"
                    items={jobPositionItems}
                    selectedKey={selectedJobId || null}
                    onSelectionChange={(k) => setValue("job_position_public_id", String(k), { shouldValidate: true })}
                    isInvalid={!!errors.job_position_public_id}
                    isDisabled={isPending}
                    placeholder="Lavozimni tanlang"
                    hint={errors.job_position_public_id?.message}
                    isRequired
                  >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            color="secondary"
            size="md"
            iconLeading={ArrowLeft}
            onClick={() => router.push("/staff")}
          >
            Orqaga
          </Button>

          <div className="flex items-center gap-3">
            <Button
              color="secondary"
              size="md"
              onClick={() => router.push("/staff")}
              isDisabled={isPending}
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
              {isPending ? "Yangilanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
