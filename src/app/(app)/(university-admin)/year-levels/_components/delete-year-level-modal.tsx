"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash01 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { useDeleteYearLevel } from "@/hooks/api/use-year-level";

interface DeleteYearLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  name: string;
}

export function DeleteYearLevelModal({
  isOpen,
  onClose,
  id,
  name,
}: DeleteYearLevelModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const { mutateAsync: deleteYearLevel, isPending } = useDeleteYearLevel();

  const isConfirmed = confirmText.trim() === name;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      await deleteYearLevel(id);
      toast.success("Kurs o'chirildi", {
        description: `${name} kursi tizimdan muvaffaqiyatli olib tashlandi.`
      });
      onClose();
    } catch (error: any) {
      toast.error("O'chirishda xatolik", {
        description: error.message || "Kursni o'chirishda kutilmagan xatolik yuz berdi."
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
      title="Kursni o'chirish"
      description="Bu amalni ortga qaytarib bo'lmaydi. O'chirishni tasdiqlash uchun quyida kurs nomini to'liq kiriting."
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
            O'chirilayotgan kurs: <strong className="font-semibold text-primary">{name}</strong>
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
