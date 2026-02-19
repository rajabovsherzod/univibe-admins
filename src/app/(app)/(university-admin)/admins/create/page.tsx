// src/app/(app)/(superadmin)/admins/create/page.tsx

import { PageHeader } from "@/components/application/headers/page-header";
import { AdminCreateModal } from "@/components/superadmin/admins/admin-create-form";

export default function AdminCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Yangi admin qo'shish"
        subtitle="Yangi admin uchun kerakli ma'lumotlarni to'ldiring."
        breadcrumbs={[
          { label: "Adminlar", href: "/superadmin/admins" },
          { label: "Yangi admin qo'shish" },
        ]}
      />
      <AdminCreateModal />
    </div>
  );
}