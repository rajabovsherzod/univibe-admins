"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useCreateYearLevel } from "@/hooks/api/use-year-level";
import { CreateYearLevelSchema, type CreateYearLevelInput } from "@/lib/validations/year-level";

interface CreateYearLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateYearLevelModal({ isOpen, onClose }: CreateYearLevelModalProps) {
  const { mutateAsync: createYearLevel, isPending } = useCreateYearLevel();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CreateYearLevelInput>({
    resolver: zodResolver(CreateYearLevelSchema) as any,
    defaultValues: {
      name: "",
      year_number: 1,
    },
  });

  useEffect(() => {
    if (isOpen) reset({ name: "", year_number: 1 });
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateYearLevelInput) => {
    try {
      await createYearLevel(data);
      toast.success("Kurs qo'shildi", {
        description: `${data.name} kursi muvaffaqiyatli ro'yxatga olindi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi", {
        description: error.message || "Kursni qo'shishda tizimli xatolik yuzaga keldi."
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Yangi kurs qo'shish"
      description="Universitetga qarashli yangi o'quv yilini (kursni) kiriting."
      icon={Plus}
      iconBgClassName="bg-brand-secondary"
      iconClassName="text-brand-secondary"
      size="sm"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={onClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="create-year-level-form"
            isDisabled={!isDirty || isPending}
            isLoading={isPending}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="create-year-level-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
