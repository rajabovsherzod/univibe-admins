// src/app/(app)/(superadmin)/admins/create/page.tsx
"use client";

import { useState } from "react";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { AdminCreateModal } from "@/components/superadmin/admins/admin-create-modal";
import { Users01 } from "@untitledui/icons";

export default function AdminCreatePage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        title="Yangi admin qo'shish"
        subtitle="Yangi admin uchun kerakli ma'lumotlarni to'ldiring."
        icon={Users01}
        breadcrumbs={[
          { label: "Adminlar", href: "/admins" },
          { label: "Yangi admin qo'shish" },
        ]}
      />
      <AdminCreateModal
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}