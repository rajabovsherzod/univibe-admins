"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit05 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useUpdateFaculty } from "@/hooks/api/use-faculty";
import { UpdateFacultySchema, type UpdateFacultyInput } from "@/lib/validations/faculty";

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  initialName: string;
}

export function EditFacultyModal({
  isOpen,
  onClose,
  id,
  initialName,
}: EditFacultyModalProps) {
  const { mutateAsync: updateFaculty, isPending } = useUpdateFaculty();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateFacultyInput>({
    resolver: zodResolver(UpdateFacultySchema),
    defaultValues: {
      name: initialName,
    },
  });

  useEffect(() => {
    if (isOpen) reset({ name: initialName });
  }, [isOpen, initialName, reset]);

  const onSubmit = async (data: UpdateFacultyInput) => {
    try {
      await updateFaculty({ id, input: data });
      toast.success("Fakultet yangilandi", {
        description: `"${initialName}" nomi "${data.name}" ga o'zgartirildi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi", {
        description: error.message || "Fakultet ma'lumotlarini yangilashda tizimli xatolik."
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Fakultetni tahrirlash"
      description="Fakultet nomini o'zgartirishingiz mumkin."
      icon={Edit05}
      size="sm"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={onClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form={`edit-faculty-form-${id}`}
            isDisabled={!isDirty || isPending}
            isLoading={isPending}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form
        id={`edit-faculty-form-${id}`}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                label="Fakultet nomi"
                placeholder="Fakultet nomi"
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
