"use client";

import * as React from "react";
import type { AdminRow } from "@/types/admins/admin";

import { Plus, UserPlus02 } from "@untitledui/icons";

import { PageHeader } from "@/components/application/headers/page-header";
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

  // demo state (keyin service ulaysan)
  const [form, setForm] = React.useState<CreateAdminPayload>({
    name: "",
    email: "",
    password: "",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Adminlar"
        subtitle="Adminlar ro‘yxatini ko‘rish, qidirish va boshqarish."
        meta={`${admins.length} ta`}
        right={
          // ✅ MUHIM: trigger click outside deb yopilib ketmasin
          <div data-modal-trigger>
            <Button type="button" onClick={() => setOpen(true)}>
              Yangi admin qo‘shish
            </Button>
          </div>
        }
      />

      <DataTable
        ariaLabel="Adminlar jadvali"
        data={admins}
        columns={adminColumns}
        rowKey="id"
        selectionMode="multiple"
        emptyTitle="Adminlar topilmadi"
        emptyDescription="Yangi admin qo‘shish uchun yuqoridagi tugmadan foydalaning."
      />

      {/* ✅ Modal har doim component ichida turadi (open bo'lsa ko'rinadi) */}
      <PremiumFormModal
        isOpen={open}
        onOpenChange={(v) => {
          // yopilganda formni reset qilamiz (xohlasang olib tashla)
          if (!v) {
            setForm({ name: "", email: "", password: "" });
          }
          setOpen(v);
        }}
        title="Yangi admin qo‘shish"
        description="Admin ma’lumotlarini kiriting."
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

            {/* ✅ form submit tashqaridan */}
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

            // ✅ keyin service ulaysan
            console.log("create admin payload:", form);

            setOpen(false);
          }}
        >
          <input
            className="w-full rounded-lg bg-primary px-3 py-2 ring-1 ring-primary ring-inset"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />

          <input
            className="w-full rounded-lg bg-primary px-3 py-2 ring-1 ring-primary ring-inset"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />

          <input
            className="w-full rounded-lg bg-primary px-3 py-2 ring-1 ring-primary ring-inset"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </form>
      </PremiumFormModal>
    </div>
  );
}
