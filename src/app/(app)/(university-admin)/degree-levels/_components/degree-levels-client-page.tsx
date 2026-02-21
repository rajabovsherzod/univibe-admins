"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Plus } from "@untitledui/icons";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable, type DataTableColumn } from "@/components/application/table/data-table";
import { Button } from "@/components/base/buttons/button";
import type { DegreeLevel } from "@/lib/api/types";
import { useDegreeLevels } from "@/hooks/api/use-degree-level";
import { getDegreeLevelColumns } from "./degree-level-columns";
import { CreateDegreeLevelModal } from "./create-degree-level-modal";
import { EditDegreeLevelModal } from "./edit-degree-level-modal";
import { DeleteDegreeLevelModal } from "./delete-degree-level-modal";

type Modal = "create" | { type: "edit"; item: DegreeLevel } | { type: "delete"; item: DegreeLevel } | null;

export default function DegreeLevelsClientPage() {
  const { data, isLoading } = useDegreeLevels();
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = (data || []).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = getDegreeLevelColumns({
    page,
    pageSize,
    onEdit: (item) => setModal({ type: "edit", item }),
    onDelete: (item) => setModal({ type: "delete", item }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Darajalar" },
        ]}
        title="Darajalar"
        subtitle="Universitetning talim darajalarini (Bakalavr, Magistr va boshqalar) boshqarish."
        count={filtered.length}
        countLabel="Jami"
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Darajani qidirish..."
        actions={
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => setModal("create")}
          >
            Yangi daraja
          </Button>
        }
      />

      <DataTable
        ariaLabel="Darajalar ro'yxati"
        data={paginatedData}
        columns={columns}
        rowKey="public_id"
        isLoading={isLoading || !data}
        emptyTitle="Darajalar topilmadi"
        emptyDescription="Hozircha tizimda hech qanday daraja mavjud emas. Yangi daraja yarating."
        pagination={{
          page: page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Modals */}
      {modal === "create" && <CreateDegreeLevelModal onClose={() => setModal(null)} />}
      {typeof modal === "object" && modal !== null && modal.type === "edit" && (
        <EditDegreeLevelModal item={modal.item} onClose={() => setModal(null)} />
      )}
      {typeof modal === "object" && modal !== null && modal.type === "delete" && (
        <DeleteDegreeLevelModal item={modal.item} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
