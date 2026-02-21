"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit05 } from "@untitledui/icons";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useUpdateDegreeLevel } from "@/hooks/api/use-degree-level";
import { UpdateDegreeLevelSchema, type UpdateDegreeLevelInput } from "@/lib/validations/degree-level";
import type { DegreeLevel } from "@/lib/api/types";

interface EditDegreeLevelModalProps {
  item: DegreeLevel;
  onClose: () => void;
}

export function EditDegreeLevelModal({ item, onClose }: EditDegreeLevelModalProps) {
  const update = useUpdateDegreeLevel();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateDegreeLevelInput>({
    resolver: zodResolver(UpdateDegreeLevelSchema),
    defaultValues: { name: item.name },
  });

  const onSubmit = async (data: UpdateDegreeLevelInput) => {
    try {
      await update.mutateAsync({ id: item.public_id, input: data });
      toast.success("Daraja muvaffaqiyatli tahrirlandi!");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(v) => !v && onClose()}
      title="Darajani tahrirlash"
      description="Talim darajasi nomini o'zgartiring."
      icon={Edit05}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={update.isPending} className="flex-1 sm:flex-none">
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="edit-degree-form"
            color="primary"
            size="md"
            isDisabled={update.isPending}
            isLoading={update.isPending}
            className="flex-1 sm:flex-none"
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="edit-degree-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Daraja nomi"
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
