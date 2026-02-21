"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useCreateFaculty } from "@/hooks/api/use-faculty";
import { CreateFacultySchema, type CreateFacultyInput } from "@/lib/validations/faculty";

interface CreateFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFacultyModal({ isOpen, onClose }: CreateFacultyModalProps) {
  const { mutateAsync: createFaculty, isPending } = useCreateFaculty();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateFacultyInput>({
    resolver: zodResolver(CreateFacultySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) reset({ name: "" });
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateFacultyInput) => {
    try {
      await createFaculty(data);
      toast.success("Fakultet qo'shildi", {
        description: `${data.name} fakulteti muvaffaqiyatli ro'yxatga olindi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi", {
        description: error.message || "Fakultetni qo'shishda tizimli xatolik yuzaga keldi."
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Yangi fakultet qo'shish"
      description="Universitetga qarashli yangi fakultet nomini kiriting."
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
            form="create-faculty-form"
            isDisabled={!isDirty || isPending}
            isLoading={isPending}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="create-faculty-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Fakultet nomi"
                placeholder="Masalan: Axborot texnologiyalari fakulteti"
                isInvalid={!!fieldState.error}
                hint={fieldState.error?.message}
                isDisabled={isPending}
                isRequired
              />
            )}
          />
        </div>
      </form>
    </PremiumFormModal>
  );
}
