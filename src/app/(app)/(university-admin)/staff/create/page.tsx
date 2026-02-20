"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, User01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations/staff";
import { useCreateStaff } from "@/hooks/api/use-staff";
import { useJobPositions } from "@/hooks/api/use-job-positions";

export default function StaffCreatePage() {
  const router = useRouter();
  const createStaff = useCreateStaff();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const jobPositionItems =
    jobPositions?.map((p) => ({ id: p.public_id, label: p.name })) ?? [];

  const onSubmit = async (data: CreateStaffInput) => {
    try {
      await createStaff.mutateAsync(data);
      toast.success("Xodim muvaffaqiyatli yaratildi!");
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
        subtitle="Yangi xodim ma'lumotlarini kiriting. * bilan belgilangan maydonlar majburiy."
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
                          setPhotoPreview(null);
                        }}
                      />
                    </FileUpload.List>
                  )}

                  {/* Profile preview if uploaded */}
                  {photoPreview && (
                    <div className="mx-auto mt-2 flex size-32 items-center justify-center overflow-hidden rounded-full bg-secondary ring-4 ring-brand-solid/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Preview" className="size-full object-cover" />
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
              showTextWhileLoading
            >
              {isPending ? "Yaratilmoqda..." : "Xodim yaratish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}