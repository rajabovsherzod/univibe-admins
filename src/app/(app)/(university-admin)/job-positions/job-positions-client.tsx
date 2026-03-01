"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit05, Trash01, Briefcase01 } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { JobPosition } from "@/lib/api/types";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import {
  useJobPositions,
  useCreateJobPosition,
  useUpdateJobPosition,
  useDeleteJobPosition,
} from "@/hooks/api/use-job-positions";

// ── Schemas ────────────────────────────────────────────────────────────────
const nameSchema = z.object({
  name: z.string().min(2, "Lavozim nomi kamida 2 harf bo'lishi kerak"),
});
type NameInput = z.infer<typeof nameSchema>;

// ── Create Modal ───────────────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateJobPosition();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NameInput>({ resolver: zodResolver(nameSchema) as any });

  const onSubmit = async (data: NameInput) => {
    try {
      await create.mutateAsync(data.name);
      toast.success("Lavozim muvaffaqiyatli yaratildi!");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(v) => !v && onClose()}
      title="Yangi lavozim"
      description="Yangi lavozim nomini kiriting."
      icon={Briefcase01}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={create.isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="create-job-form"
            color="primary"
            size="md"
            isDisabled={create.isPending}
            isLoading={create.isPending}
          >
            Yaratish
          </Button>
        </div>
      }
    >
      <form id="create-job-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Lavozim nomi"
              placeholder="Masalan: Dekan yordamchisi"
              value={field.value || ""}
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

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ item, onClose }: { item: JobPosition; onClose: () => void }) {
  const update = useUpdateJobPosition();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NameInput>({
    resolver: zodResolver(nameSchema) as any,
    defaultValues: { name: item.name },
  });

  const onSubmit = async (data: NameInput) => {
    try {
      await update.mutateAsync({ id: item.public_id, name: data.name });
      toast.success("Lavozim yangilandi!");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(v) => !v && onClose()}
      title="Lavozimni tahrirlash"
      description="Lavozim nomini o'zgartiring."
      icon={Edit05}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={update.isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="edit-job-form"
            color="primary"
            size="md"
            isDisabled={update.isPending}
            isLoading={update.isPending}
          >
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="edit-job-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Lavozim nomi"
              value={field.value || ""}
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

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ item, onClose }: { item: JobPosition; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const del = useDeleteJobPosition();

  const isConfirmed = confirmText.trim() === item.name;

  const onConfirm = async () => {
    if (!isConfirmed) return;
    try {
      await del.mutateAsync(item.public_id);
      toast.success("Lavozim o'chirildi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(v) => {
        if (!v) {
          setConfirmText("");
          onClose();
        }
      }}
      title="Lavozimni o'chirish"
      description="Bu amalni qaytarib bo'lmaydi."
      icon={Trash01}
      iconBgClassName="bg-error-50 text-error-600 ring-error-50"
      iconClassName="text-error-600"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button color="secondary" size="md" onClick={onClose} isDisabled={del.isPending}>
            Bekor qilish
          </Button>
          <Button
            onClick={onConfirm}
            color="primary-destructive"
            size="md"
            isDisabled={!isConfirmed || del.isPending}
            isLoading={del.isPending}
          >
            O&apos;chirish
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <p className="text-sm text-secondary">
            O'chirilayotgan lavozim: <strong className="font-semibold text-primary">{item.name}</strong>
          </p>
        </div>

        <Input
          label="Tasdiqlash"
          placeholder={`"${item.name}" ni kiriting`}
          value={confirmText}
          onChange={setConfirmText}
          isDisabled={del.isPending}
          isRequired
          className="focus-visible:ring-error-500"
        />
      </div>
    </PremiumFormModal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type Modal = "create" | { type: "edit"; item: JobPosition } | { type: "delete"; item: JobPosition } | null;

export default function JobPositionsClientPage() {
  const { data, isLoading } = useJobPositions();
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = (data || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: DataTableColumn<JobPosition>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[52px]",
      cellClassName: "py-3.5",
      cell: (_row, i) => (
        <span className="text-sm tabular-nums text-tertiary">
          {(page - 1) * pageSize + (i ?? 0) + 1}
        </span>
      ),
    },
    {
      id: "name",
      header: "Lavozim nomi",
      isRowHeader: true,
      headClassName: "min-w-[280px]",
      cellClassName: "py-3.5",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-solid/10">
            <Briefcase01 className="size-4 text-brand-solid" />
          </div>
          <span className="text-sm font-semibold text-primary">{row.name}</span>
        </div>
      ),
    },
    {
      id: "university",
      header: "Universitet",
      headClassName: "min-w-[200px]",
      cellClassName: "py-3.5",
      cell: (row) => (
        <span className="text-sm text-secondary">{(row as any).university_name || "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      headClassName: "w-[100px]",
      cellClassName: "py-3.5 px-3",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            color="tertiary"
            size="sm"
            iconLeading={Edit05}
            onClick={() => setModal({ type: "edit", item: row })}
            aria-label="Tahrirlash"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash01}
            onClick={() => setModal({ type: "delete", item: row })}
            aria-label="O'chirish"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Lavozimlar" },
        ]}
        title="Lavozimlar"
        subtitle="Universitet xodimlari uchun lavozimlarni boshqarish."
        count={filtered.length}
        countLabel="Jami"
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Lavozimni qidirish..."
        actions={
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setModal("create")}
          >
            Yangi lavozim
          </Button>
        }
      />

      <DataTable
        ariaLabel="Lavozimlar ro'yxati"
        data={paginatedData}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Lavozimlar topilmadi"
        emptyDescription="Hozircha hech qanday lavozim mavjud emas. Yangi lavozim qo'shing."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Modals */}
      {modal === "create" && <CreateModal onClose={() => setModal(null)} />}
      {typeof modal === "object" && modal !== null && modal.type === "edit" && (
        <EditModal item={modal.item} onClose={() => setModal(null)} />
      )}
      {typeof modal === "object" && modal !== null && modal.type === "delete" && (
        <DeleteModal item={modal.item} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
