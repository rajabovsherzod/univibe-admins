"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit05, Trash01, Briefcase01, X } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import type { JobPosition } from "@/lib/api/types";
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

// ── Shared input style ─────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary placeholder:text-placeholder outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid transition-all";

// ── Create Modal ───────────────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateJobPosition();
  const {
    register,
    handleSubmit,
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
    <Backdrop onClose={onClose}>
      <ModalCard title="Yangi lavozim" onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-secondary">
              Lavozim nomi <span className="text-error-primary">*</span>
            </label>
            <input
              {...register("name")}
              autoFocus
              placeholder="Masalan: Dekan yordamchisi"
              className={errors.name ? inputCls.replace("ring-secondary", "ring-error-primary") : inputCls}
            />
            {errors.name && (
              <p className="text-xs text-error-primary">{errors.name.message}</p>
            )}
          </div>
          <ModalActions onClose={onClose} isPending={create.isPending} submitLabel="Yaratish" />
        </form>
      </ModalCard>
    </Backdrop>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ item, onClose }: { item: JobPosition; onClose: () => void }) {
  const update = useUpdateJobPosition();
  const {
    register,
    handleSubmit,
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
    <Backdrop onClose={onClose}>
      <ModalCard title="Lavozimni tahrirlash" onClose={onClose}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-secondary">
              Lavozim nomi <span className="text-error-primary">*</span>
            </label>
            <input
              {...register("name")}
              autoFocus
              className={errors.name ? inputCls.replace("ring-secondary", "ring-error-primary") : inputCls}
            />
            {errors.name && (
              <p className="text-xs text-error-primary">{errors.name.message}</p>
            )}
          </div>
          <ModalActions onClose={onClose} isPending={update.isPending} submitLabel="Saqlash" />
        </form>
      </ModalCard>
    </Backdrop>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────────────
function DeleteModal({ item, onClose }: { item: JobPosition; onClose: () => void }) {
  const del = useDeleteJobPosition();

  const onConfirm = async () => {
    try {
      await del.mutateAsync(item.public_id);
      toast.success("Lavozim o'chirildi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik", { description: e.message });
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalCard title="Lavozimni o'chirish" onClose={onClose}>
        <div className="flex flex-col gap-5">
          <p className="text-sm text-secondary">
            <span className="font-semibold text-primary">«{item.name}»</span> lavozimini
            o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
          </p>
          <div className="flex justify-end gap-3 border-t border-secondary pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-secondary ring-1 ring-secondary transition hover:bg-secondary"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={del.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-error-solid px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {del.isPending && <Spinner />}
              O'chirish
            </button>
          </div>
        </div>
      </ModalCard>
    </Backdrop>
  );
}

// ── Shared modal primitives ────────────────────────────────────────────────
function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

function ModalCard({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-primary shadow-2xl ring-1 ring-secondary">
      <div className="flex items-center justify-between bg-brand-solid px-5 py-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ModalActions({
  onClose,
  isPending,
  submitLabel,
}: {
  onClose: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-secondary pt-4">
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="rounded-lg px-4 py-2.5 text-sm font-medium text-secondary ring-1 ring-secondary transition hover:bg-secondary disabled:opacity-50"
      >
        Bekor qilish
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover disabled:opacity-60"
      >
        {isPending && <Spinner />}
        {submitLabel}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type Modal = "create" | { type: "edit"; item: JobPosition } | { type: "delete"; item: JobPosition } | null;

export default function JobPositionsPage() {
  const { data, isLoading } = useJobPositions();
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");

  const filtered = (data || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: DataTableColumn<JobPosition>[] = [
    {
      id: "index",
      header: "№",
      headClassName: "w-[52px]",
      cellClassName: "py-3.5",
      cell: (_row, i) => (
        <span className="text-sm tabular-nums text-tertiary">{(i ?? 0) + 1}</span>
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
          <button
            type="button"
            onClick={() => setModal({ type: "edit", item: row })}
            className="rounded-lg p-1.5 text-tertiary transition hover:bg-secondary hover:text-primary"
            title="Tahrirlash"
          >
            <Edit05 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "delete", item: row })}
            className="rounded-lg p-1.5 text-tertiary transition hover:bg-error-soft hover:text-error-primary"
            title="O'chirish"
          >
            <Trash01 className="size-4" />
          </button>
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
        onSearch={(e) => setSearch(e.target.value)}
        searchPlaceholder="Lavozim qidirish..."
        actions={
          <button
            type="button"
            onClick={() => setModal("create")}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
          >
            <Plus className="size-4" />
            Yangi lavozim
          </button>
        }
      />

      <DataTable
        ariaLabel="Lavozimlar ro'yxati"
        data={filtered}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading}
        emptyTitle="Lavozimlar topilmadi"
        emptyDescription="Hozircha hech qanday lavozim mavjud emas. Yangi lavozim qo'shing."
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
