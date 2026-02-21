"use client";

import { useState } from "react";
import { Plus, GraduationHat01 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";

import { useYearLevels } from "@/hooks/api/use-year-level";

import { getYearLevelColumns } from "./year-level-columns";
import { CreateYearLevelModal } from "./create-year-level-modal";
import { EditYearLevelModal } from "./edit-year-level-modal";
import { DeleteYearLevelModal } from "./delete-year-level-modal";

export default function YearLevelsClientPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string; name: string; year_number: number } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);

  // Data fetching
  const { data, isLoading } = useYearLevels();

  // Handlers for Row Actions
  const handleEdit = (id: string, name: string, year_number: number) => {
    setEditItem({ id, name, year_number });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  const columns = getYearLevelColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Client-side filtering & pagination
  const filteredData = (data || []).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.year_number.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Kurslar" },
        ]}
        title="Kurslar (O'quv yili)"
        subtitle="Universitetingizdagi o'quv yili darajalarini qo'shing, tahrirlang yoki o'chiring."
        icon={GraduationHat01}
        count={filteredData.length}
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Kurslarni qidirish..."
        actions={
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Yangi kurs qo'shish
          </Button>
        }
      />

      <DataTable
        ariaLabel="Kurslar ro'yxati"
        data={paginatedData}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Kurslar topilmadi"
        emptyDescription="Hozircha tizimda hech qanday kurs mavjud emas. Yangi ro'yxatga olish uchun yuqoridagi tugmani bosing."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Modals */}
      <CreateYearLevelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {editItem && (
        <EditYearLevelModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          id={editItem.id}
          initialName={editItem.name}
          initialYearNumber={editItem.year_number}
        />
      )}

      {deleteItem && (
        <DeleteYearLevelModal
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          id={deleteItem.id}
          name={deleteItem.name}
        />
      )}
    </div>
  );
}
