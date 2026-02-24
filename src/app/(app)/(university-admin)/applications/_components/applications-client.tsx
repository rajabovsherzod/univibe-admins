"use client";

import { useState } from "react";
import { DataTable } from "@/components/application/table/data-table";
import { newStudentColumns } from "./new-student-columns";
import { useStudents } from "@/hooks/api/use-students";
import { StudentDetailsModal } from "./student-details-modal";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { FileCheck02 } from "@untitledui/icons";

export function ApplicationsClient() {
  const [page, setPage] = useState(1);
  const [viewedStudent, setViewedStudent] = useState<any | null>(null);

  const { data, isLoading, refetch } = useStudents({
    page,
    page_size: 10,
    search: "",
    status: "waited",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Yangi talabalar" },
        ]}
        title="Yangi talabalar"
        subtitle="Yangi o'quv yiliga ro'yxatdan o'tgan talabalarni tasdiqlash paneli."
        icon={FileCheck02}
      />

      <DataTable
        ariaLabel="Yangi talabalar"
        data={data?.results?.map((item: any) => ({ ...item, onView: () => setViewedStudent(item), onSuccess: refetch })) || []}
        columns={newStudentColumns}
        rowKey="user_public_id"
        isLoading={isLoading || !data}
        emptyTitle="Arizalar topilmadi"
        emptyDescription="Hozircha kutilayotgan yangi talabalar yo'q."
        pagination={{
          page,
          total: Math.ceil((data?.count || 0) / 10) || 1,
          onPageChange: setPage,
        }}
      />

      {viewedStudent && (
        <StudentDetailsModal
          isOpen={!!viewedStudent}
          onClose={() => setViewedStudent(null)}
          student={viewedStudent}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
