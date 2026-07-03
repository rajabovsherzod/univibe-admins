"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, User01, Shield01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { ProfilePhotoUploader } from "@/components/application/profile-photo-uploader/profile-photo-uploader";
import { PermissionMatrix } from "@/components/application/rbac/permission-matrix";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations/staff";
import { useCreateStaff } from "@/hooks/api/use-staff";
import { useJobPositions } from "@/hooks/api/use-job-positions";
import { useRbacCatalog } from "@/hooks/api/use-rbac-catalog";
import { cx } from "@/utils/cx";

const CARD_SHADOW = "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]";

export default function StaffCreatePage() {
  const router = useRouter();
  const createStaff = useCreateStaff();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions();
  const { data: catalog, isLoading: catalogLoading } = useRbacCatalog();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Pre-check the recommended default-on (read-only) permissions for a new staff member.
  useEffect(() => {
    if (catalog) setPermissions(catalog.default_on);
  }, [catalog]);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema) as any,
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      job_position_public_id: "",
      password: "",
      profile_photo: null,
    },
  });

  const selectedJobId = watch("job_position_public_id");
  const nameValue = watch("name");
  const surnameValue = watch("surname");

  const jobPositionItems =
    jobPositions?.map((p) => ({ id: p.public_id, label: p.name })) ?? [];

  const onSubmit = async (data: CreateStaffInput) => {
    try {
      await createStaff.mutateAsync({ ...data, permissions });
      toast.success("Xodim va uning ruxsatlari muvaffaqiyatli yaratildi!");
      router.push("/staff");
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
  };

  const isPending = isSubmitting || createStaff.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Xodimlar", href: "/staff" },
          { label: "Yangi xodim" },
        ]}
        title="Yangi xodim qo'shish"
        subtitle="Yangi xodim ma'lumotlarini va nima qila olishini kiriting. * bilan belgilangan maydonlar majburiy."
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
                fullName={[nameValue, surnameValue].filter(Boolean).join(" ")}
                isDisabled={isPending}
                onSelect={(file) => {
                  setValue("profile_photo", file as any, { shouldValidate: true });
                  setPhotoPreview(URL.createObjectURL(file));
                }}
                onRemove={() => {
                  setValue("profile_photo", null, { shouldValidate: true });
                  setPhotoPreview(null);
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

                  {/* Email */}
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <Input
                        label="Email"
                        type="email"
                        placeholder="azizbek@univibe.uz"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        isInvalid={!!errors.email}
                        hint={errors.email?.message}
                        isRequired
                      />
                    )}
                  />

                  {/* Job position — UntitledUI Select */}
                  <Select
                    id="job_position"
                    label="Lavozim"
                    items={jobPositionItems}
                    selectedKey={selectedJobId || null}
                    onSelectionChange={(k) => setValue("job_position_public_id", String(k), { shouldValidate: true })}
                    isInvalid={!!errors.job_position_public_id}
                    isDisabled={jobsLoading || isPending}
                    placeholder={jobsLoading ? "Lavozimlar yuklanmoqda..." : "Lavozimni tanlang"}
                    hint={errors.job_position_public_id?.message}
                    isRequired
                  >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                  </Select>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Controller
                      control={control}
                      name="password"
                      render={({ field }) => (
                        <Input
                          label="Parol (ixtiyoriy)"
                          type={showPassword ? "text" : "password"}
                          placeholder="Kiritilmasa, avtomatik yaratiladi"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          isInvalid={!!errors.password}
                          hint={errors.password?.message}
                        />
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        color="link-gray"
                        size="sm"
                        iconLeading={showPassword ? EyeOff : Eye}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                      </Button>
                    </div>
                    <p className="text-xs text-tertiary">
                      Bo&apos;sh qoldirilsa, xavfsiz parol avtomatik yaratiladi
                    </p>
                  </div>
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
              Bu xodim tizimda nima qila olishini belgilang. Ruxsatlar aynan shu xodimga
              biriktiriladi va istalgan vaqt tahrirlash sahifasidan o'zgartirilishi mumkin.
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
              {isPending ? "Yaratilmoqda..." : "Xodim yaratish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
