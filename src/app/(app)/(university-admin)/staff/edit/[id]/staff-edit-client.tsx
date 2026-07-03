"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, User01, Shield01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ProfilePhotoUploader } from "@/components/application/profile-photo-uploader/profile-photo-uploader";
import { PermissionMatrix } from "@/components/application/rbac/permission-matrix";
import { updateStaffSchema, type UpdateStaffInput } from "@/lib/validations/staff";
import { useUpdateStaffProfile } from "@/hooks/api/use-staff";
import { useRbacCatalog } from "@/hooks/api/use-rbac-catalog";
import { cx } from "@/utils/cx";

const CARD_SHADOW = "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]";

interface StaffEditPageClientProps {
  staffData: {
    user_public_id: string;
    name: string;
    surname: string;
    email: string;
    job_position_public_id: string;
    profile_photo_url: string | null;
    full_name: string;
    permissions: string[];
  };
  jobPositions: Array<{
    public_id: string;
    name: string;
  }>;
}

export default function StaffEditPageClient({ staffData, jobPositions }: StaffEditPageClientProps) {
  const router = useRouter();
  const updateStaff = useUpdateStaffProfile();
  const { data: catalog, isLoading: catalogLoading } = useRbacCatalog();
  const [photoPreview, setPhotoPreview] = useState<string | null>(staffData.profile_photo_url || null);
  const [permissions, setPermissions] = useState<string[]>(staffData.permissions);
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
  const nameValue = watch("name");
  const surnameValue = watch("surname");
  const jobPositionItems = jobPositions.map((p) => ({ id: p.public_id, label: p.name }));

  const onSubmit = async (data: UpdateStaffInput) => {
    try {
      await updateStaff.mutateAsync({ ...data, user_public_id: staffData.user_public_id, permissions });
      toast.success("Xodim ma'lumotlari va ruxsatlari muvaffaqiyatli yangilandi!");
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
        title={`Xodimni tahrirlash — ${staffData.full_name}`}
        subtitle="Xodim ma'lumotlarini va nima qila olishini o'zgartiring. * bilan belgilangan maydonlar majburiy."
        icon={User01}
      />

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LEFT: Profile avatar */}
          <div className="lg:col-span-1">
            <div className={cx("overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary", CARD_SHADOW)}>
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Profil rasmi</h2>
              </div>
              <ProfilePhotoUploader
                photoPreview={photoPreview}
                fullName={[nameValue, surnameValue].filter(Boolean).join(" ") || staffData.full_name}
                isDisabled={isPending}
                onSelect={(file) => {
                  setValue("profile_photo", file as any, { shouldValidate: true });
                  setPhotoPreview(URL.createObjectURL(file));
                }}
                onRemove={() => {
                  setValue("profile_photo", null, { shouldValidate: true });
                  setPhotoPreview(initialPhotoUrl);
                }}
              />
            </div>
          </div>

          {/* RIGHT: Main fields */}
          <div className="lg:col-span-2">
            <div className={cx("overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary", CARD_SHADOW)}>
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

        {/* Permissions — full width, below the grid */}
        <div className={cx("overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary", CARD_SHADOW)}>
          <div className="flex items-center gap-2 bg-brand-solid px-5 py-3.5">
            <Shield01 className="size-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Ruxsatlar</h2>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-tertiary">
              Bu xodim tizimda nima qila olishini shu yerda o'zgartirasiz. Ruxsatlar aynan shu
              xodimga tegishli — boshqa bir xil lavozimdagi xodimlarga ta'sir qilmaydi.
            </p>
            {catalogLoading || !catalog ? (
              <p className="py-8 text-center text-sm text-tertiary">Yuklanmoqda...</p>
            ) : (
              <PermissionMatrix
                catalog={catalog}
                value={permissions}
                onChange={setPermissions}
                isDisabled={isPending}
              />
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between">
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
