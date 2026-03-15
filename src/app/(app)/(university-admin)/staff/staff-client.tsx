"use client";

import React, { useState, ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Plus } from "@untitledui/icons";
import Link from "next/link";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { API_CONFIG } from "@/lib/api/config";
import type { StaffListResponseItem } from "@/lib/api/types";
import { getStaffColumns } from "./_components/staff-columns";
import { DeleteStaffModal } from "./_components/delete-staff-modal";
import { toast } from "sonner";

async function fetchStaffList(token: string): Promise<StaffListResponseItem[]> {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.list}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Ma'lumotlarni yuklashda xatolik yuz berdi");
  return res.json();
}

export default function StaffPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: () => fetchStaffList(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const selectedItem = data?.find((item) => item.user_public_id === deleteItemId);

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
  };

  const handleCloseDeleteModal = () => {
    setDeleteItemId(null);
  };

  const handleView = (id: string) => {
  };

  const columns = getStaffColumns({
    onDelete: handleDelete,
    onView: () => {},
  });

  const filteredData = (data || []).filter(
    (item) =>
      item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Xodimlar" },
        ]}
        title="Xodimlar"
        subtitle="Universitet xodimlari va ularning ma'lumotlarini boshqarish."
        count={filteredData.length}
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Xodimlarni qidirish..."
        actions={
          <Link
            href="/staff/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover"
          >
            <Plus className="size-4" />
            Yangi xodim
          </Link>
        }
      />

      <DataTable
        ariaLabel="Xodimlar ro'yxati"
        data={paginatedData}
        columns={columns}
        rowKey="user_public_id"
        isLoading={isLoading || !data}
        emptyTitle="Xodimlar topilmadi"
        emptyDescription="Hozircha tizimda hech qanday xodim mavjud emas."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {selectedItem && (
        <DeleteStaffModal
          item={selectedItem}
          isOpen={!!deleteItemId}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}