"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Trash01 } from "@untitledui/icons";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useDeleteStaff } from "@/hooks/api/use-staff";
import type { StaffListResponseItem } from "@/lib/api/types";

interface DeleteStaffModalProps {
  item: StaffListResponseItem;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteStaffModal({ item, isOpen, onClose }: DeleteStaffModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const del = useDeleteStaff();

  const isMatching = confirmName.trim() === item.full_name;

  const onConfirm = async () => {
    if (!isMatching) return;
    try {
      await del.mutateAsync(item.user_public_id);
      toast.success("Xodim muvaffaqiyatli o'chirildi");
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
      title="Xodimni o'chirish"
      description="Bu amalni qaytarib bo'lmaydi."
      icon={Trash01}
      iconBgClassName="bg-error-solid"
      iconClassName="text-white"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={del.isPending} className="flex-1 sm:flex-none">
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
            Haqiqatan ham <strong className="font-semibold text-primary">«{item.full_name}»</strong> ismli xodimni o&apos;chirmoqchimisiz?
            Tizimdagi bu ma&apos;lumot butunlay o&apos;chib ketadi.
          </p>
        </div>

        <Input
          label="Tasdiqlash uchun xodim ismini kiriting"
          placeholder={item.full_name}
          value={confirmName}
          onChange={setConfirmName}
          autoFocus
        />
      </div>
    </PremiumFormModal>
  );
}
