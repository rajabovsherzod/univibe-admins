"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { DataTable } from "@/components/application/table/data-table";
import { productColumns } from "./product-columns";
import { useProducts, useArchiveProduct } from "../_hooks/use-products";
import { CreateProductModal } from "./create-product-modal";

const PAGE_SIZE = 20;

export function MarketClient() {
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string } | null>(null);
  const { data, isPending } = useProducts({
    search: search || undefined,
    include_archived: includeArchived,
    page,
    page_size: PAGE_SIZE,
  });
  const { mutate: archive, isPending: archiving } = useArchiveProduct();

  const products = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Add actions column
  const columns = [
    ...productColumns,
    {
      id: "actions",
      header: "",
      headClassName: "w-20",
      cellClassName: "w-20 text-right",
      cell: (row: any) =>
        row.is_active ? (
          <button
            onClick={() => setArchiveTarget({ id: row.public_id, name: row.name })}
            className="text-xs font-medium text-error-600 dark:text-error-400 hover:underline"
          >
            Arxiv
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Market" },
        ]}
        title="Market"
        subtitle="Mahsulotlarni boshqarish va do'kon sozlamalari."
        count={totalCount}
        showSearch
        searchValue={search}
        onSearch={(v: string) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Mahsulotlarni qidirish..."
        actions={
          <Button color="primary" size="md" iconLeading={Plus} onClick={() => setShowCreate(true)}>
            Yangi mahsulot
          </Button>
        }
      />

      {/* Archive filter */}
      <div className="flex items-center gap-2 -mt-2">
        <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => {
              setIncludeArchived(e.target.checked);
              setPage(1);
            }}
            className="rounded border-secondary size-4"
          />
          Arxivlanganlarni ko'rsatish
        </label>
      </div>

      {/* DataTable */}
      <DataTable
        ariaLabel="Mahsulotlar jadvali"
        data={products}
        columns={columns as any}
        rowKey="public_id"
        isLoading={isPending}
        emptyTitle="Mahsulot topilmadi"
        emptyDescription="Hozircha hech qanday mahsulot yaratilmagan."
        pagination={{
          page,
          total: totalPages,
          onPageChange: setPage,
        }}
      />

      {/* Create modal */}
      <CreateProductModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Archive confirm modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setArchiveTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-primary border border-secondary shadow-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-error-100 dark:bg-error-600/10 mb-4">
                <svg className="size-6 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-primary mb-1.5">Mahsulotni arxivlash</h3>
              <p className="text-sm text-tertiary leading-relaxed">
                <strong>&quot;{archiveTarget.name}&quot;</strong> mahsulot arxivlanadi va talabalar ko'ra olmaydi. Davom etasizmi?
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setArchiveTarget(null)}
                disabled={archiving}
                className="flex-1 h-10 rounded-lg border border-secondary bg-primary text-sm font-semibold text-secondary hover:bg-secondary transition-colors disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  archive(archiveTarget.id, {
                    onSuccess: () => { toast.success("Arxivlandi"); setArchiveTarget(null); },
                    onError: () => toast.error("Xatolik"),
                  });
                }}
                disabled={archiving}
                className="flex-1 h-10 rounded-lg bg-error-600 hover:bg-error-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {archiving ? "Yuklanmoqda..." : "Arxivlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
