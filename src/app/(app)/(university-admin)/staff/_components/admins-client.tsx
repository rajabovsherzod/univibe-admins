"use client";

import * as React from "react";
import type { AdminRow } from "@/types/admins/admin";

import { Plus, UserPlus02, Users01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { adminColumns } from "./admin-columns";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export function AdminsClient({ admins }: { admins: AdminRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filtered = admins.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

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
        count={filtered.length}
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Admin qidirish..."
        icon={Users01}
        actions={
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setOpen(true)}
          >
            Yangi admin qo&apos;shish
          </Button>
        }
      />

      <DataTable
        ariaLabel="Adminlar jadvali"
        data={paginatedData}
        columns={adminColumns}
        rowKey="id"
        selectionMode="multiple"
        emptyTitle="Adminlar topilmadi"
        emptyDescription="Yangi admin qo'shish uchun yuqoridagi tugmadan foydalaning."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
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
            setOpen(false);
          }}
        >
          <Input
            label="Ism"
            placeholder="Ism"
            value={form.name}
            onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            isRequired
          />

          <Input
            label="Email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            isRequired
          />

          <Input
            label="Parol"
            type="password"
            placeholder="Parol"
            value={form.password}
            onChange={(v) => setForm((p) => ({ ...p, password: v }))}
            isRequired
          />
        </form>
      </PremiumFormModal>
    </div>
  );
}
