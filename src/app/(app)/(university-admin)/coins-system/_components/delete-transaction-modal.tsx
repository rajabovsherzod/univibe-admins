"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash01 } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { TextArea } from "@/components/base/textarea/textarea";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useDeleteTransaction } from "@/hooks/api/use-transactions";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionPublicId: string;
  amount: number;
  studentName?: string;
}

export function DeleteTransactionModal({
  isOpen,
  onClose,
  transactionPublicId,
  amount,
  studentName,
}: DeleteTransactionModalProps) {
  const [reason, setReason] = useState("");
  const { mutateAsync: deleteTransaction, isPending } = useDeleteTransaction();

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleDelete = async () => {
    if (!reason.trim()) return;
    try {
      await deleteTransaction({
        transaction_public_id: transactionPublicId,
        deletion_reason: reason.trim(),
      });
      toast.success("Tranzaksiya bekor qilindi", {
        description: "Talaba balansi mos ravishda yangilandi.",
      });
      handleClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi", {
        description: error.message || "Tizimli xatolik.",
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      title="Tranzaksiyani bekor qilish"
      description={
        studentName
          ? `${studentName}ga berilgan tranzaksiya o'chiriladi.`
          : "Tanlangan tranzaksiya o'chiriladi."
      }
      icon={Trash01}
      iconBgClassName="bg-error-100 dark:bg-error-900/30"
      iconClassName="text-error-600 dark:text-error-400"
      size="sm"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={handleClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleDelete}
            isDisabled={isPending || !reason.trim()}
            isLoading={isPending}
            className="!bg-error-600 !text-white hover:!bg-error-700 !ring-error-600"
          >
            O&apos;chirish
          </Button>
        </div>
      }
    >
      {/* Amount preview */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 px-4 py-3">
        <CoinOutlineIcon size={16} color="#D97706" strokeWidth={22} />
        <span className="text-sm font-semibold text-error-700 dark:text-error-400">
          -{amount.toLocaleString()} ball talabadan chiqariladi
        </span>
      </div>

      <TextArea
        label="Bekor qilish sababi"
        placeholder="Nima sababdan bekor qilinmoqda..."
        value={reason}
        onChange={setReason}
        rows={3}
        isDisabled={isPending}
        isRequired
      />
    </PremiumFormModal>
  );
}
