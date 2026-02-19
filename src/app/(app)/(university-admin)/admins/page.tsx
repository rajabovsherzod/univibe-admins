"use client";

import React, { useState, ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Plus, Users01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import { API_CONFIG } from "@/lib/api/config";
import type { StaffListResponseItem } from "@/lib/api/types";
import { getStaffColumns } from "../../_components/admins/admins-columns";
import { toast } from "sonner";
import { CustomToast } from "@/components/base/toast/custom-toast";

async function fetchStaffList(token: string): Promise<StaffListResponseItem[]> {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.list}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ma'lumotlarni yuklashda xatolik yuz berdi");
  }

  return res.json();
}

export default function AdminsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-list"],
    queryFn: () => fetchStaffList(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const handleEdit = (id: string) => {
    console.log("Edit", id);
    toast.info("Tahrirlash funksiyasi tez orada qo'shiladi");
  };

  const handleDelete = (id: string) => {
    console.log("Delete", id);
    toast.custom((t) => (
      <CustomToast
        t={t}
        type="warning"
        title="O'chirish"
        description="Bu funksiya tez orada ishga tushadi."
      />
    ));
  };

  const handleView = (id: string) => {
    console.log("View", id);
  };

  const columns = getStaffColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  });

  // Client-side filtering
  const filteredData = (data || []).filter((item) =>
    item.full_name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Adminlar" },
        ]}
        title="Adminlar"
        subtitle="Universitet adminlari va xodimlarni boshqarish."
        count={filteredData.length}
        showSearch
        searchValue={search}
        onSearch={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        icon={Users01}
        actions={
          <button
            type="button"
            onClick={() => toast.info("Qo'shish funksiyasi tez orada...")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs ring-0 transition hover:bg-brand-solid_hover"
          >
            <Plus className="size-4" />
            Admin qo'shish
          </button>
        }
      />

      <DataTable
        ariaLabel="Adminlar ro'yxati"
        data={filteredData}
        columns={columns}
        rowKey="user_public_id"
        isLoading={isLoading}
        emptyTitle="Adminlar topilmadi"
        emptyDescription="Hozircha tizimda hech qanday admin yoki xodim mavjud emas."
      />
    </div>
  );
}