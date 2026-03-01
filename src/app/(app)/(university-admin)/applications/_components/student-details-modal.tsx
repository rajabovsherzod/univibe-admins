"use client";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Avatar } from "@/components/base/avatar/avatar";
import { format } from "date-fns";
import type { WaitedStudentRow } from "./new-student-columns";
import { Button } from "@/components/base/buttons/button";
import { CheckCircle, XCircle } from "@untitledui/icons";
import { useUpdateStudentStatus } from "@/hooks/api/use-students";
import { toHttps } from "@/utils/cx";
import { toast } from "sonner";
import { useState } from "react";

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: WaitedStudentRow;
  onSuccess: () => void;
}

export function StudentDetailsModal({ isOpen, onClose, student, onSuccess }: StudentDetailsModalProps) {
  const { mutateAsync: updateStatus } = useUpdateStudentStatus();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    try {
      setLoadingAction(status === "approved" ? "approve" : "reject");
      await updateStatus({ id: student.user_public_id, status });
      toast.success(
        status === "approved"
          ? "Talaba muvaffaqiyatli tasdiqlandi"
          : "Talaba arizasi rad etildi"
      );
      onSuccess();
      onClose(); // auto close on success
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(v) => { if (!v) onClose(); }}
      title="Talaba Ma'lumotlari"
      description="Talaba tomonidan tizimdan ro'yxatdan o'tish jarayonida kiritilgan barcha tafsilotlar."
      icon={() => (
        <Avatar
          size="md"
          src={toHttps(student.profile_photo_url)}
          initials={(student.full_name || "T").substring(0, 2).toUpperCase()}
        />
      )}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            color="secondary"
            onClick={onClose}
          >
            Yopish
          </Button>
          <Button
            color="primary-destructive"
            iconLeading={XCircle}
            onClick={() => handleStatusChange("rejected")}
            isLoading={loadingAction === "reject"}
            isDisabled={loadingAction !== null}
          >
            Rad etish
          </Button>
          <Button
            color="primary"
            iconLeading={CheckCircle}
            onClick={() => handleStatusChange("approved")}
            isLoading={loadingAction === "approve"}
            isDisabled={loadingAction !== null}
            className="bg-success-solid hover:bg-success-solid_hover text-white ring-0 shadow-xs"
          >
            Tasdiqlash
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="To'liq ism" value={student.full_name} />
          <DetailItem label="Email manzili" value={student.email} />
          <DetailItem label="Telefon raqami" value={student.contact_phone_number} />
          <DetailItem
            label="Tug'ilgan sanasi"
            value={student.date_of_birth ? format(new Date(student.date_of_birth), "dd.MM.yyyy") : null}
          />
        </div>

        <div className="h-px w-full bg-secondary" />

        {/* Academic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Universitet ID" value={student.university_student_id} />
          <DetailItem label="Fakultet" value={student.faculty_name} />
          <DetailItem label="Daraja" value={student.degree_level_name} />
          <DetailItem label="Kurs" value={student.year_level_name} />
          <DetailItem
            label="Ro'yxatdan o'tgan sana"
            value={student.created_at ? format(new Date(student.created_at), "dd.MM.yyyy HH:mm") : null}
          />
        </div>
      </div>
    </PremiumFormModal>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-tertiary">{label}</span>
      <span className="text-sm text-primary">{value || "—"}</span>
    </div>
  );
}
