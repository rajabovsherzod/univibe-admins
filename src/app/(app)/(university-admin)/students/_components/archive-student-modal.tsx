"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Archive, FlipBackward } from "@untitledui/icons";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { useArchiveStudent, useUnarchiveStudent } from "@/hooks/api/use-students";
import { ARCHIVE_REASON_LABELS } from "./student-columns";

export type ArchiveTarget = { id: string; name: string };

const REASON_ITEMS = Object.entries(ARCHIVE_REASON_LABELS).map(([id, label]) => ({ id, label }));

// ── Arxivlash ──────────────────────────────────────────────────────────────
export function ArchiveStudentModal({
  target,
  isOpen,
  onClose,
}: {
  target: ArchiveTarget;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<string>("GRADUATED");
  const [note, setNote] = useState("");
  const archive = useArchiveStudent();

  const reset = () => {
    setReason("GRADUATED");
    setNote("");
  };

  const onConfirm = async () => {
    try {
      await archive.mutateAsync({ id: target.id, reason, note: note.trim() });
      toast.success("Talaba arxivlandi", { description: target.name });
      reset();
      onClose();
    } catch (e: any) {
      toast.error("Arxivlashda xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
      title="Talabani arxivlash"
      description="Talaba faolsizlantiriladi va arxivga o'tkaziladi."
      icon={Archive}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            color="secondary"
            size="md"
            onClick={onClose}
            isDisabled={archive.isPending}
            className="flex-1 sm:flex-none"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            size="md"
            isDisabled={archive.isPending}
            isLoading={archive.isPending}
            className="flex-1 sm:flex-none"
          >
            Arxivlash
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <p className="text-sm text-secondary">
            <strong className="font-semibold text-primary">«{target.name}»</strong> tizimga kira
            olmaydi va reytinglardan chiqariladi. Keyinchalik istalgan vaqtda arxivdan tiklash
            mumkin.
          </p>
        </div>

        <Select
          label="Arxivlash sababi"
          aria-label="Arxivlash sababi"
          selectedKey={reason}
          onSelectionChange={(k) => setReason(k as string)}
          items={REASON_ITEMS}
        >
          {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
        </Select>

        <Input
          label="Izoh (ixtiyoriy)"
          placeholder="Masalan: 2026-yil bitiruvchisi"
          value={note}
          onChange={setNote}
        />
      </div>
    </PremiumFormModal>
  );
}

// ── Arxivdan tiklash ───────────────────────────────────────────────────────
export function UnarchiveStudentModal({
  target,
  isOpen,
  onClose,
}: {
  target: ArchiveTarget;
  isOpen: boolean;
  onClose: () => void;
}) {
  const unarchive = useUnarchiveStudent();

  const onConfirm = async () => {
    try {
      await unarchive.mutateAsync(target.id);
      toast.success("Talaba tiklandi", { description: target.name });
      onClose();
    } catch (e: any) {
      toast.error("Tiklashda xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title="Arxivdan tiklash"
      description="Talaba qayta faollashtiriladi."
      icon={FlipBackward}
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            color="secondary"
            size="md"
            onClick={onClose}
            isDisabled={unarchive.isPending}
            className="flex-1 sm:flex-none"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            size="md"
            isDisabled={unarchive.isPending}
            isLoading={unarchive.isPending}
            className="flex-1 sm:flex-none"
          >
            Tiklash
          </Button>
        </div>
      }
    >
      <div className="pt-2">
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <p className="text-sm text-secondary">
            Haqiqatan ham <strong className="font-semibold text-primary">«{target.name}»</strong>{" "}
            ni arxivdan tiklaysizmi? Talaba yana tizimga kira oladi va reytinglarda qatnashadi.
          </p>
        </div>
      </div>
    </PremiumFormModal>
  );
}
