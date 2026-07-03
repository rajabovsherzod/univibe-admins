"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DataTable } from "@/components/application/table/data-table";
import type { DataTableColumn } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Shield01 } from "@untitledui/icons";
import { API_CONFIG } from "@/lib/api/config";
import type { StaffListResponseItem } from "@/lib/api/types";

async function fetchStaffList(token: string): Promise<StaffListResponseItem[]> {
  const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.staff.list}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Ma'lumotlarni yuklashda xatolik yuz berdi");
  return res.json();
}

/**
 * Ruxsatlar har bir xodimga alohida biriktiriladi (lavozimga emas), shuning
 * uchun bu yerda faqat xodimlar ro'yxati va tahrirlash havolasi ko'rsatiladi —
 * haqiqiy tahrirlash "Xodimlar" bo'limidagi xodim sahifasida amalga oshiriladi.
 */
export function PermissionsTab() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: () => fetchStaffList(session?.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const columns: DataTableColumn<StaffListResponseItem>[] = [
    {
      id: "name",
      header: "Xodim",
      isRowHeader: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{row.full_name}</span>
          <span className="text-xs text-tertiary">{row.email}</span>
        </div>
      ),
    },
    {
      id: "job_position",
      header: "Lavozim",
      cell: (row) => <span className="text-sm text-secondary">{row.job_position || "—"}</span>,
    },
    {
      id: "count",
      header: "Berilgan ruxsatlar",
      cell: (row) => (
        <Badge color="brand" size="sm">
          {(row.permissions ?? []).length} ta
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <div className="flex justify-end">
          <Link href={`/staff/edit/${row.user_public_id}`}>
            <Button size="sm" color="secondary" iconLeading={Shield01}>
              Ruxsatlarni tahrirlash
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-tertiary">
        Ruxsatlar har bir xodimning o'ziga biriktiriladi. Bir xil lavozimdagi xodimlar turlicha
        ruxsatga ega bo'lishi mumkin. Tahrirlash uchun xodimning "Ruxsatlarni tahrirlash"
        tugmasini bosing — bu sizni Xodimlar bo'limidagi tahrirlash sahifasiga olib boradi.
      </p>
      <DataTable
        ariaLabel="Xodimlar va ruxsatlari"
        data={data || []}
        columns={columns}
        rowKey="user_public_id"
        isLoading={isLoading}
        emptyTitle="Xodimlar topilmadi"
        emptyDescription="Hozircha hech qanday xodim kiritilmagan."
      />
    </div>
  );
}
