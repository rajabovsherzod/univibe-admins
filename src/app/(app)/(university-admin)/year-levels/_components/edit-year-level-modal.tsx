"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit05 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useUpdateYearLevel } from "@/hooks/api/use-year-level";
import { UpdateYearLevelSchema, type UpdateYearLevelInput } from "@/lib/validations/year-level";

interface EditYearLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  initialName: string;
  initialYearNumber: number;
}

export function EditYearLevelModal({
  isOpen,
  onClose,
  id,
  initialName,
  initialYearNumber,
}: EditYearLevelModalProps) {
  const { mutateAsync: updateYearLevel, isPending } = useUpdateYearLevel();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateYearLevelInput>({
    resolver: zodResolver(UpdateYearLevelSchema) as any,
    defaultValues: {
      name: initialName,
      year_number: initialYearNumber,
    },
  });

  useEffect(() => {
    if (isOpen) reset({ name: initialName, year_number: initialYearNumber });
  }, [isOpen, initialName, initialYearNumber, reset]);

  const onSubmit = async (data: UpdateYearLevelInput) => {
    try {
      await updateYearLevel({ id, input: data });
      toast.success("Kurs yangilandi", {
        description: `"${initialName}" kursi ma'lumotlari muvaffaqiyatli o'zgartirildi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi", {
        description: error.message || "Kurs ma'lumotlarini yangilashda tizimli xatolik."
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Kursni tahrirlash"
      description="Kurs nomini yoki raqamini o'zgartirishingiz mumkin."
      icon={Edit05}
      size="sm"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={onClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form={`edit-year-level-form-${id}`}
            isDisabled={!isDirty || isPending}
            isLoading={isPending}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form
        id={`edit-year-level-form-${id}`}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="Kurs nomi"
              placeholder="Masalan: 1-kurs (Freshman)"
              isInvalid={!!fieldState.error}
              hint={fieldState.error?.message}
              isDisabled={isPending}
              isRequired
            />
          )}
        />

        <Controller
          name="year_number"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="number"
              label="Kurs raqami"
              placeholder="1"
              isInvalid={!!fieldState.error}
              hint={fieldState.error?.message}
              isDisabled={isPending}
              isRequired
              onChange={(v: string) => field.onChange(Number(v) || 0)}
              value={field.value?.toString() || ""}
            />
          )}
        />

      </form>
    </PremiumFormModal>
  );
}
