'use client';

import { useMemo, useState } from 'react';
import { useAdminEventParticipants, useAdminEventDetail } from "@/hooks/api/use-events-admin";
import { DataTable, DataTableColumn } from "@/components/application/table/data-table";
import { EventRegistration } from "@/types/events";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CheckCircle, QrCode01, DownloadCloud02, SearchMd } from "@untitledui/icons";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { cx } from "@/utils/cx";
import { ParticipantQrModal } from "./participant-qr-modal";
import { downloadAttendanceQrPdf } from "./attendance-qr-pdf";

// Solid status badges (never outline/soft).
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  REGISTERED: { label: "Kutilmoqda", cls: "bg-utility-warning-600 text-white" },
  ATTENDED: { label: "Qatnashdi", cls: "bg-utility-success-600 text-white" },
  CANCELLED: { label: "Bekor qilgan", cls: "bg-utility-gray-500 text-white" },
  MISSED: { label: "Qatnashmadi", cls: "bg-utility-error-600 text-white" },
};

type StatusFilter = 'ALL' | 'REGISTERED' | 'ATTENDED';
const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'Barchasi' },
  { id: 'REGISTERED', label: 'Kutilmoqda' },
  { id: 'ATTENDED', label: 'Qatnashdi' },
];

export function EventParticipantsTab({ eventId }: { eventId: string }) {
  const { data: participants, isLoading } = useAdminEventParticipants(eventId);
  const { data: event } = useAdminEventDetail(eventId); // deduped with parent fetch
  const { can } = usePermissions();
  const canMarkAttendance = can("events.attendance");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [qrRegistration, setQrRegistration] = useState<EventRegistration | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const filtered = useMemo(() => {
    const list = participants ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.student.get_full_name?.toLowerCase().includes(q) ||
        r.student.email?.toLowerCase().includes(q)
      );
    });
  }, [participants, search, statusFilter]);

  const attendedCount = useMemo(
    () => (participants ?? []).filter((r) => r.status === "ATTENDED").length,
    [participants]
  );

  const columns = useMemo<DataTableColumn<EventRegistration>[]>(() => [
    {
      id: "index",
      header: "№",
      headClassName: "w-[56px]",
      cell: (_row, i) => (
        <span className="text-sm font-medium tabular-nums text-tertiary">#{(i ?? 0) + 1}</span>
      ),
    },
    {
      id: "student",
      header: "Talaba",
      accessor: "student",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.student.get_full_name}</span>
          <span className="text-xs text-muted-foreground">{row.student.email}</span>
        </div>
      ),
    },
    {
      id: "registered_at",
      header: "Ro'yxatdan o'tgan vaqt",
      accessor: "registered_at",
      cell: (row) => (
        <span className="text-sm">{new Date(row.registered_at).toLocaleString('uz-UZ')}</span>
      ),
    },
    {
      id: "status",
      header: "Holat",
      accessor: "status",
      cell: (row) => {
        const config = STATUS_MAP[row.status] || { label: row.status, cls: "bg-utility-gray-500 text-white" };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.cls}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Amallar",
      headClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "REGISTERED" && canMarkAttendance && row.attendance_token && (
            <Button
              color="secondary"
              size="sm"
              iconLeading={QrCode01}
              onClick={() => setQrRegistration(row)}
            >
              Davomat olish
            </Button>
          )}
          {row.status === "ATTENDED" && (
            <span className="inline-flex items-center justify-end gap-1 text-xs font-medium text-success-600">
              <CheckCircle className="size-4" /> Belgilandi
            </span>
          )}
        </div>
      ),
    },
  ], [canMarkAttendance]);

  const handleDownloadPdf = async () => {
    if (!participants?.length) {
      toast.error("Yuklab olish uchun qatnashchilar yo'q");
      return;
    }
    setPdfLoading(true);
    try {
      const count = await downloadAttendanceQrPdf(
        {
          title: event?.title ?? "Tadbir",
          start_time: event?.start_time,
          location: event?.location,
          coin_reward: event?.coin_reward,
        },
        participants
      );
      toast.success(`${count} ta qatnashchi uchun QR PDF tayyorlandi`);
    } catch {
      toast.error("PDF yaratishda xatolik yuz berdi");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-2 pb-4">
      {/* Toolbar: status tabs + search (left), PDF (right) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Quick status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg self-start">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cx(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  statusFilter === tab.id
                    ? "bg-brand-solid text-white shadow-sm"
                    : "text-tertiary hover:text-secondary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={search}
              onChange={(v) => setSearch(v as string)}
              icon={SearchMd}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-tertiary sm:inline">
            {attendedCount} / {participants?.length ?? 0} qatnashdi
          </span>
          {canMarkAttendance && (
            <Button
              color="secondary"
              size="sm"
              iconLeading={DownloadCloud02}
              onClick={handleDownloadPdf}
              isLoading={pdfLoading}
            >
              QR PDF
            </Button>
          )}
        </div>
      </div>

      <DataTable
        ariaLabel="Qatnashchilar ro'yxati"
        rowKey="public_id"
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyTitle={search || statusFilter !== 'ALL' ? "Hech narsa topilmadi." : "Hech kim ro'yxatdan o'tmagan."}
        emptyDescription={search || statusFilter !== 'ALL' ? "Boshqa filtr bilan urinib ko'ring." : "Hozircha qatnashchilar yo'q."}
      />

      {qrRegistration && (
        <ParticipantQrModal registration={qrRegistration} onClose={() => setQrRegistration(null)} />
      )}
    </div>
  );
}
