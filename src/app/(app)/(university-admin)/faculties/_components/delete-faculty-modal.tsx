"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash01 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useDeleteFaculty } from "@/hooks/api/use-faculty";

interface DeleteFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  name: string;
}

export function DeleteFacultyModal({
  isOpen,
  onClose,
  id,
  name,
}: DeleteFacultyModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const { mutateAsync: deleteFaculty, isPending } = useDeleteFaculty();

  const isConfirmed = confirmText.trim() === name;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      await deleteFaculty(id);
      toast.success("Fakultet o'chirildi", {
        description: `${name} fakulteti tizimdan muvaffaqiyatli olib tashlandi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("O'chirishda xatolik", {
        description: error.message || "Fakultetni o'chirishda kutilmagan xatolik yuz berdi."
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmText("");
          onClose();
        }
      }}
      title="Fakultetni o'chirish"
      description="Bu amalni ortga qaytarib bo'lmaydi. O'chirishni tasdiqlash uchun quyida fakultet nomini to'liq kiriting."
      icon={Trash01}
      iconBgClassName="bg-error-50 text-error-600 ring-error-50"
      iconClassName="text-error-600"
      size="sm"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={onClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            color="primary-destructive"
            onClick={handleDelete}
            isDisabled={!isConfirmed || isPending}
            isLoading={isPending}
          >
            Ha, o'chirish
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <p className="text-sm text-secondary">
            O'chirilayotgan fakultet: <strong className="font-semibold text-primary">{name}</strong>
          </p>
        </div>

        <Input
          label="Tasdiqlash"
          placeholder={`"${name}" ni kiriting`}
          value={confirmText}
          onChange={setConfirmText}
          isDisabled={isPending}
          isRequired
          className="focus-visible:ring-error-500"
        />
      </div>
    </PremiumFormModal>
  );
}
