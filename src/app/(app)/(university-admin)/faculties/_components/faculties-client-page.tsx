"use client";

import { useState } from "react";
import { Plus, Building03 } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";

import { useFaculties } from "@/hooks/api/use-faculty";

import { getFacultyColumns } from "./faculty-columns";
import { CreateFacultyModal } from "./create-faculty-modal";
import { EditFacultyModal } from "./edit-faculty-modal";
import { DeleteFacultyModal } from "./delete-faculty-modal";

export function FacultiesClientPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string; name: string } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);

  // Data fetching
  const { data, isLoading } = useFaculties();

  // Handlers for Row Actions
  const handleEdit = (id: string, name: string) => {
    setEditItem({ id, name });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  const columns = getFacultyColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Client-side filtering & pagination
  const filteredData = (data || []).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Fakultetlar" },
        ]}
        title="Fakultetlar"
        subtitle="Universitetingizdagi fakultetlarni qo'shish, tahrirlash va boshqarish paneli."
        icon={Building03}
        count={filteredData.length}
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Fakultet nomini qidirish..."
        actions={
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Yangi fakultet qo'shish
          </Button>
        }
      />

      <DataTable
        ariaLabel="Fakultetlar ro'yxati"
        data={paginatedData}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Fakultetlar topilmadi"
        emptyDescription="Hozircha tizimda hech qanday fakultet mavjud emas. Yangi qo'shish uchun yuqoridagi tugmani bosing."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Modals */}
      <CreateFacultyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {editItem && (
        <EditFacultyModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          id={editItem.id}
          initialName={editItem.name}
        />
      )}

      {deleteItem && (
        <DeleteFacultyModal
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          id={deleteItem.id}
          name={deleteItem.name}
        />
      )}
    </div>
  );
}
