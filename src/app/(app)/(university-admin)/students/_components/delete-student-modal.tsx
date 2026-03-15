"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash01 } from "@untitledui/icons";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useDeleteStudent } from "@/hooks/api/use-students";
import type { Student } from "@/lib/api/types";

interface DeleteStudentModalProps {
  item: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteStudentModal({ item, isOpen, onClose }: DeleteStudentModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const del = useDeleteStudent();

  const fullName = [item.name, item.middle_name, item.surname].filter(Boolean).join(" ");
  const isMatching = confirmName.trim() === fullName;

  const onConfirm = async () => {
    if (!isMatching) return;
    try {
      await del.mutateAsync(item.user_public_id);
      toast.success("Talaba muvaffaqiyatli o'chirildi");
      setConfirmName("");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setConfirmName("");
          onClose();
        }
      }}
      title="Talabani o'chirish"
      description="Bu amalni qaytarib bo'lmaydi."
      icon={Trash01}
      iconBgClassName="bg-error-solid"
      iconClassName="text-white"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button 
            color="secondary" 
            size="md" 
            onClick={onClose} 
            isDisabled={del.isPending}
            className="flex-1 sm:flex-none"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={onConfirm}
            color="primary-destructive"
            size="md"
            isDisabled={!isMatching || del.isPending}
            isLoading={del.isPending}
            className="flex-1 sm:flex-none"
          >
            O&apos;chirish
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <p className="text-sm text-secondary">
            Haqiqatan ham <strong className="font-semibold text-primary">«{fullName}»</strong> ismli talabani o&apos;chirmoqchimisiz?
            Tizimdagi bu ma&apos;lumot butunlay o&apos;chib ketadi.
          </p>
        </div>

        <Input
          label="Tasdiqlash uchun talaba ismini kiriting"
          placeholder={fullName}
          value={confirmName}
          onChange={setConfirmName}
          autoFocus
        />
      </div>
    </PremiumFormModal>
  );
}
