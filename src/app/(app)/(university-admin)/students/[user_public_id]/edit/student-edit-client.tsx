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
import { updateStudentSchema, type UpdateStudentInput } from "@/lib/validations/student";
import { useUpdateStudentProfile } from "@/hooks/api/use-students";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { parseDate } from "@internationalized/date";
import Image from "next/image";
import { toHttps } from "@/utils/cx";

interface StudentEditClientProps {
  studentData: {
    user_public_id: string;
    name: string;
    surname: string;
    middle_name: string | null;
    date_of_birth: string | null;
    university_student_id: string;
    faculty_public_id: string | null;
    faculty_name: string | null;
    degree_level_public_id: string | null;
    degree_level_name: string | null;
    year_level_public_id: string | null;
    year_level_name: string | null;
    contact_phone_number: string | null;
    profile_photo_url: string | null;
    email: string;
  };
  faculties: Array<{
    public_id: string;
    name: string;
  }>;
  degreeLevels: Array<{
    public_id: string;
    name: string;
  }>;
  yearLevels: Array<{
    public_id: string;
    name: string;
  }>;
}

export default function StudentEditClient({ 
  studentData, 
  faculties, 
  degreeLevels, 
  yearLevels 
}: StudentEditClientProps) {
  const router = useRouter();
  const updateStudent = useUpdateStudentProfile();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema) as any,
    defaultValues: {
      name: studentData.name || "",
      surname: studentData.surname || "",
      middle_name: studentData.middle_name || "",
      date_of_birth: studentData.date_of_birth || "",
      university_student_id: studentData.university_student_id || "",
      faculty_id: studentData.faculty_public_id || "",
      degree_level_id: studentData.degree_level_public_id || "",
      year_level_id: studentData.year_level_public_id || "",
      contact_phone_number: studentData.contact_phone_number || "",
      profile_photo: null,
    },
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    toHttps(studentData.profile_photo_url) || null
  );
  const initialPhotoUrl = toHttps(studentData.profile_photo_url) || null;

  const facultyItems = faculties.map((f) => ({ id: f.public_id, label: f.name }));
  const degreeItems = degreeLevels.map((d) => ({ id: d.public_id, label: d.name }));
  const yearItems = yearLevels.map((y) => ({ id: y.public_id, label: y.name }));

  const onSubmit = async (data: UpdateStudentInput) => {
    try {
      await updateStudent.mutateAsync({ 
        ...data, 
        user_public_id: studentData.user_public_id 
      });
      toast.success("Talaba ma'lumotlari muvaffaqiyatli yangilandi!");
      router.push(`/students/${studentData.user_public_id}`);
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
  };

  const isPending = isSubmitting || updateStudent.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Talabalar", href: "/students" },
          { label: "Tahrirlash" },
        ]}
        title="Talabani tahrirlash"
        subtitle="Talaba ma'lumotlarini yangilang"
        icon={User01}
        actions={
          <Button 
            color="secondary" 
            iconLeading={ArrowLeft} 
            size="md"
            onClick={() => router.push(`/students/${studentData.user_public_id}`)}
          >
            Orqaga
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT - Photo */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-secondary bg-bg-secondary shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-secondary">
                <h3 className="text-sm font-semibold text-primary">Profil rasmi</h3>
              </div>
              <div className="p-5">
                <Controller
                  name="profile_photo"
                  control={control}
                  render={({ field }) => (
                    <FileUpload.Root>
                      <FileUpload.DropZone
                        accept="image/png, image/jpeg, image/webp"
                        allowsMultiple={false}
                        maxSize={5 * 1024 * 1024}
                        onDropFiles={(files: FileList | File[]) => {
                          const file = files[0];
                          if (!file) return;
                          field.onChange(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }}
                        onSizeLimitExceed={() => toast.error("Kechirasiz, rasm hajmi 5 MB dan oshmasligi kerak")}
                        hint="PNG, JPG yoki WebP (Maks. 5 MB)"
                      />

                      {watch("profile_photo") || initialPhotoUrl ? (
                        <FileUpload.List>
                          <FileUpload.ListItemProgressBar
                            name={(watch("profile_photo") as any)?.name || "Rasm"}
                            size={(watch("profile_photo") as any)?.size || 0}
                            progress={100}
                            onDelete={() => {
                              setValue("profile_photo", null, { shouldValidate: true });
                              setPhotoPreview(null);
                            }}
                          />
                        </FileUpload.List>
                      ) : null}
                    </FileUpload.Root>
                  )}
                />
              </div>
            </div>
          </div>

          {/* RIGHT - Form fields */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Shaxsiy ma'lumotlar */}
            <div className="rounded-2xl border border-secondary bg-bg-secondary shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-secondary">
                <h3 className="text-sm font-semibold text-primary">Shaxsiy ma'lumotlar</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Ism talab qilinadi" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Ism *"
                      placeholder="Alisher"
                      isInvalid={!!errors.name}
                      hint={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="surname"
                  control={control}
                  rules={{ required: "Familiya talab qilinadi" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Familiya *"
                      placeholder="Toshmatov"
                      isInvalid={!!errors.surname}
                      hint={errors.surname?.message}
                    />
                  )}
                />

                <Controller
                  name="middle_name"
                  control={control}
                  rules={{ required: "Otasining ismi talab qilinadi" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Otasining ismi *"
                      placeholder="Baxtiyorovich"
                      isInvalid={!!errors.middle_name}
                      hint={errors.middle_name?.message}
                    />
                  )}
                />

                <Controller
                  name="date_of_birth"
                  control={control}
                  rules={{ required: "Tug'ilgan sana talab qilinadi" }}
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-primary">
                        Tug'ilgan sana *
                      </label>
                      <DatePicker
                        value={field.value ? parseDate(field.value) : null}
                        onChange={(v) => field.onChange(v ? v.toString() : "")}
                        aria-label="Tug'ilgan sana"
                      />
                      {errors.date_of_birth && (
                        <p className="text-xs text-error-600">
                          {errors.date_of_birth.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="contact_phone_number"
                  control={control}
                  rules={{ required: "Telefon raqam talab qilinadi" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Telefon raqam *"
                      placeholder="+998 90 123 45 67"
                      type="tel"
                      isInvalid={!!errors.contact_phone_number}
                      hint={errors.contact_phone_number?.message}
                    />
                  )}
                />

                <div className="sm:col-span-2">
                  <Controller
                    name="university_student_id"
                    control={control}
                    rules={{ required: "Talaba ID talab qilinadi" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Talaba ID *"
                        placeholder="21060101"
                        isInvalid={!!errors.university_student_id}
                        hint={errors.university_student_id?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Akademik ma'lumotlar */}
            <div className="rounded-2xl border border-secondary bg-bg-secondary shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-secondary">
                <h3 className="text-sm font-semibold text-primary">Akademik ma'lumotlar</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="faculty_id"
                  control={control}
                  rules={{ required: "Fakultet tanlanishi shart" }}
                  render={({ field }) => (
                    <Select
                      label="Fakultet *"
                      placeholder="Fakultetni tanlang"
                      size="md"
                      selectedKey={field.value || null}
                      onSelectionChange={(k) => field.onChange(k)}
                      isInvalid={!!errors.faculty_id}
                      items={facultyItems}
                    >
                      {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                  )}
                />

                <Controller
                  name="degree_level_id"
                  control={control}
                  rules={{ required: "Ta'lim darajasi tanlanishi shart" }}
                  render={({ field }) => (
                    <Select
                      label="Ta'lim darajasi *"
                      placeholder="Darajani tanlang"
                      size="md"
                      selectedKey={field.value || null}
                      onSelectionChange={(k) => field.onChange(k)}
                      isInvalid={!!errors.degree_level_id}
                      items={degreeItems}
                    >
                      {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                  )}
                />

                <Controller
                  name="year_level_id"
                  control={control}
                  rules={{ required: "Kurs tanlanishi shart" }}
                  render={({ field }) => (
                    <Select
                      label="Kurs *"
                      placeholder="Kursni tanlang"
                      size="md"
                      selectedKey={field.value || null}
                      onSelectionChange={(k) => field.onChange(k)}
                      isInvalid={!!errors.year_level_id}
                      items={yearItems}
                    >
                      {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-5 border-t border-secondary">
          <Button
            type="button"
            color="secondary"
            size="md"
            onClick={() => router.push(`/students/${studentData.user_public_id}`)}
            isDisabled={isPending}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            color="primary"
            size="md"
            isLoading={isPending}
            className="w-full sm:w-auto min-w-[160px] order-1 sm:order-2"
          >
            Saqlash
          </Button>
        </div>
      </form>
    </div>
  );
}
