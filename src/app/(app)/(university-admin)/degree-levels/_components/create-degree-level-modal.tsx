"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "@untitledui/icons";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useCreateDegreeLevel } from "@/hooks/api/use-degree-level";
import { CreateDegreeLevelSchema, type CreateDegreeLevelInput } from "@/lib/validations/degree-level";

interface CreateDegreeLevelModalProps {
  onClose: () => void;
}

export function CreateDegreeLevelModal({ onClose }: CreateDegreeLevelModalProps) {
  const create = useCreateDegreeLevel();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateDegreeLevelInput>({
    resolver: zodResolver(CreateDegreeLevelSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: CreateDegreeLevelInput) => {
    try {
      await create.mutateAsync(data);
      toast.success("Daraja muvaffaqiyatli yaratildi!");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(v) => !v && onClose()}
      title="Yangi daraja yaratish"
      description="Universitetingiz uchun yangi talim darajasi (Bakalavr, Magistr) qo'shing."
      icon={Plus}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={create.isPending} className="flex-1 sm:flex-none">
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="create-degree-form"
            color="primary"
            size="md"
            isDisabled={create.isPending}
            isLoading={create.isPending}
            className="flex-1 sm:flex-none"
          >
            Yaratish
          </Button>
        </div>
      }
    >
      <form id="create-degree-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Daraja nomi"
              placeholder="Masalan: Bakalavr"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!errors.name}
              hint={errors.name?.message}
              isRequired
              autoFocus
            />
          )}
        />
      </form>
    </PremiumFormModal>
  );
}
