"use client";

import type { DataTableColumn } from "@/components/application/table/data-table";
import type { Student } from "@/lib/api/types";
import { Button } from "@/components/base/buttons/button";
import { CheckCircle, XCircle, Eye } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { useUpdateStudentStatus } from "@/hooks/api/use-students";
import { toast } from "sonner";
import { useState } from "react";
import { Tooltip } from "@/components/base/tooltip/tooltip";

export type WaitedStudentRow = Student & {
  onView?: () => void;
  onSuccess?: () => void;
};

function StudentActions({ row }: { row: WaitedStudentRow }) {
  const { mutateAsync: updateStatus } = useUpdateStudentStatus();
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    try {
      setLoadingAction(status === "approved" ? "approve" : "reject");
      await updateStatus({ id: row.user_public_id, status });
      toast.success(
        status === "approved"
          ? "Talaba muvaffaqiyatli tasdiqlandi"
          : "Talaba arizasi rad etildi"
      );
      if (row.onSuccess) row.onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 text-fg-success-secondary">
      <Button
        color="secondary"
        size="sm"
        iconLeading={Eye}
        onClick={() => row.onView?.()}
        aria-label="Ko'rish"
        className="ring-1 ring-secondary shadow-xs font-semibold"
      >
        Detallar
      </Button>
      <Button
        color="primary"
        size="sm"
        iconLeading={CheckCircle}
        onClick={() => handleStatusChange("approved")}
        isLoading={loadingAction === "approve"}
        isDisabled={loadingAction !== null}
        aria-label="Tasdiqlash"
        className="bg-success-solid hover:bg-success-solid_hover text-white ring-0 shadow-xs"
      />
      <Button
        color="primary-destructive"
        size="sm"
        iconLeading={XCircle}
        onClick={() => handleStatusChange("rejected")}
        isLoading={loadingAction === "reject"}
        isDisabled={loadingAction !== null}
        aria-label="Rad etish"
      />
    </div>
  );
}

export const newStudentColumns: DataTableColumn<WaitedStudentRow>[] = [
  {
    id: "index",
    header: "№",
    headClassName: "w-[50px]",
    cell: (row, i) => (
      <span className="text-sm tabular-nums text-tertiary">{(i ?? 0) + 1}</span>
    ),
  },
  {
    id: "student",
    header: "Talaba",
    isRowHeader: true,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={row.profile_photo_url || undefined}
          initials={(row.full_name || "T").substring(0, 2).toUpperCase()}
          size="sm"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">
            {row.full_name || "Ism ko'rsatilmagan"}
          </span>
          <span className="text-xs text-tertiary">
            {row.email || "Email yo'q"}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "faculty",
    header: "Fakultet",
    cell: (row) => (
      <span className="text-sm text-secondary">
        {row.faculty_name || "Kiritilmagan"}
      </span>
    ),
  },
  {
    id: "course",
    header: "Bosqich / Kurs",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="text-sm text-secondary">
          {row.degree_level_name || "Daraja yo'q"}
        </span>
        <span className="text-xs text-tertiary">
          {row.year_level_name || "Kurs yo'q"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    headClassName: "w-[200px]",
    cell: (row) => <StudentActions row={row} />,
  },
];
