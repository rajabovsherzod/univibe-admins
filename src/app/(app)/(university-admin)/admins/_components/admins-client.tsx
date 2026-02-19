"use client";

import * as React from "react";
import type { AdminRow } from "@/types/admins/admin";

import { Plus, UserPlus02, Users01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { adminColumns } from "./admin-columns";

import { Button } from "@/components/base/buttons/button";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export function AdminsClient({ admins }: { admins: AdminRow[] }) {
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<CreateAdminPayload>({
    name: "",
    email: "",
    password: "",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Adminlar" },
        ]}
        title="Adminlar"
        subtitle="Adminlar ro'yxatini ko'rish, qidirish va boshqarish."
        count={admins.length}
        icon={Users01}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs ring-0 transition hover:bg-brand-solid_hover"
          >
            <Plus className="size-4" />
            Yangi admin qo'shish
          </button>
        }
      />

      <DataTable
        ariaLabel="Adminlar jadvali"
        data={admins}
        columns={adminColumns}
        rowKey="id"
        selectionMode="multiple"
        emptyTitle="Adminlar topilmadi"
        emptyDescription="Yangi admin qo'shish uchun yuqoridagi tugmadan foydalaning."
      />

      <PremiumFormModal
        isOpen={open}
        onOpenChange={(v) => {
          if (!v) {
            setForm({ name: "", email: "", password: "" });
          }
          setOpen(v);
        }}
        title="Yangi admin qo'shish"
        description="Admin ma'lumotlarini kiriting."
        icon={UserPlus02}
        iconBgClassName="bg-brand-secondary"
        iconClassName="text-brand-secondary"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              color="secondary"
              type="button"
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" form="create-admin-form">
              Saqlash
            </Button>
          </div>
        }
      >
        <form
          id="create-admin-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("create admin payload:", form);
            setOpen(false);
          }}
        >
          <input
            className="w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary ring-inset shadow-xs placeholder:text-placeholder focus:ring-2 focus:ring-brand-solid outline-none transition-shadow"
            placeholder="Ism"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <input
            className="w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary ring-inset shadow-xs placeholder:text-placeholder focus:ring-2 focus:ring-brand-solid outline-none transition-shadow"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />

          <input
            className="w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary ring-inset shadow-xs placeholder:text-placeholder focus:ring-2 focus:ring-brand-solid outline-none transition-shadow"
            placeholder="Parol"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </form>
      </PremiumFormModal>
    </div>
  );
}
