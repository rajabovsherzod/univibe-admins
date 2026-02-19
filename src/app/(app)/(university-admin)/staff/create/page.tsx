"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload01, Eye, EyeOff, ArrowLeft, User01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { createStaffSchema, type CreateStaffInput } from "@/lib/validations/staff";
import { useCreateStaff } from "@/hooks/api/use-staff";
import { useJobPositions } from "@/hooks/api/use-job-positions";
import { cx } from "@/utils/cx";

// ── Reusable form field wrapper ────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-secondary">
        {label}
        {required && <span className="ml-0.5 text-error-primary">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error-primary">{error}</p>}
    </div>
  );
}

// ── Input base styles ───────────────────────────────────────────────────────
const inputBase =
  "w-full rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder outline-none ring-1 ring-inset transition-all";
const inputRing = "ring-secondary focus:ring-2 focus:ring-brand-solid";
const inputError = "ring-error-primary focus:ring-error-primary";

export default function StaffCreatePage() {
  const router = useRouter();
  const createStaff = useCreateStaff();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("profile_photo", file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
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
              {/* Card header */}
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Profil rasmi</h2>
              </div>
              <div className="flex flex-col items-center gap-4 p-6">
                {/* Preview */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-secondary ring-4 ring-brand-solid/20 transition hover:ring-brand-solid/40"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <Upload01 className="size-7 text-brand-solid/60" />
                      <span className="text-xs text-tertiary leading-tight px-2">
                        Rasm yuklash
                      </span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-brand-secondary hover:text-brand-solid transition-colors"
                  >
                    {photoPreview ? "Rasmni almashtirish" : "Rasm tanlash"}
                  </button>
                  <p className="mt-0.5 text-xs text-tertiary">
                    JPG, PNG yoki WebP. Maks. 5 MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Main fields */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-secondary">
              {/* Card header */}
              <div className="bg-brand-solid px-5 py-3.5">
                <h2 className="text-sm font-semibold text-white">Asosiy ma'lumotlar</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Name */}
                  <Field label="Ism" required error={errors.name?.message}>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="Azizbek"
                      className={cx(inputBase, errors.name ? inputError : inputRing)}
                    />
                  </Field>

                  {/* Surname */}
                  <Field label="Familiya" required error={errors.surname?.message}>
                    <input
                      {...register("surname")}
                      type="text"
                      placeholder="Rahimov"
                      className={cx(inputBase, errors.surname ? inputError : inputRing)}
                    />
                  </Field>

                  {/* Email */}
                  <Field label="Email" required error={errors.email?.message} >
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="azizbek@univibe.uz"
                      className={cx(inputBase, errors.email ? inputError : inputRing)}
                    />
                  </Field>

                  {/* Job position — UntitledUI Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-secondary">
                      Lavozim <span className="text-error-primary">*</span>
                    </label>
                    <Select
                      placeholder={jobsLoading ? "Yuklanmoqda..." : "Lavozim tanlang"}
                      isDisabled={jobsLoading}
                      selectedKey={selectedJobId || null}
                      onSelectionChange={(key) =>
                        setValue("job_position_public_id", key as string, {
                          shouldValidate: true,
                        })
                      }
                      items={jobPositionItems}
                      isInvalid={!!errors.job_position_public_id}
                    >
                      {(item) => <Select.Item id={item.id} label={item.label} />}
                    </Select>
                    {errors.job_position_public_id && (
                      <p className="text-xs text-error-primary">
                        {errors.job_position_public_id.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <Field
                    label="Parol (ixtiyoriy)"
                    error={errors.password?.message}
                  >
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Kiritilmasa, avtomatik yaratiladi"
                        className={cx(
                          inputBase,
                          "pr-10",
                          errors.password ? inputError : inputRing
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-quaternary hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-tertiary">
                      Bo'sh qoldirilsa, xavfsiz parol avtomatik yaratiladi
                    </p>
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/staff")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-secondary ring-1 ring-secondary transition hover:bg-secondary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Orqaga
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/staff")}
              disabled={isPending}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-secondary ring-1 ring-secondary transition hover:bg-secondary disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover disabled:opacity-60"
            >
              {isPending && (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isPending ? "Yaratilmoqda..." : "Xodim yaratish"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}