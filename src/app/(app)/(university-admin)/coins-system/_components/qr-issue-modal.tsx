"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { QrCode01, Check, X as XIcon } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useRuleQrToken, useQrRequests, useDecideQrRequest, type QrIssueRequest } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { toHttps } from "@/utils/cx";

interface QrIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: CoinRule | null;
}

/** Shows the rule's QR full-screen for students to scan; polls the pending
 * claims and walks the staff through SweetAlert confirmations one by one. */
export function QrIssueModal({ isOpen, onClose, rule }: QrIssueModalProps) {
  const { mutateAsync: getToken, isPending: tokenLoading } = useRuleQrToken();
  const { mutateAsync: decide, isPending: deciding } = useDecideQrRequest();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const { data: pending = [] } = useQrRequests({
    status: "PENDING",
    rule: rule?.public_id,
    enabled: isOpen && !!rule,
    refetchInterval: 2500,
  });

  // generate the QR when the modal opens
  useEffect(() => {
    if (!isOpen || !rule) { setQrDataUrl(null); return; }
    let alive = true;
    getToken(rule.public_id)
      .then((res) =>
        QRCode.toDataURL(res.token, { width: 640, margin: 1, color: { dark: "#0a2540", light: "#ffffff" } })
      )
      .then((url) => { if (alive) setQrDataUrl(url); })
      .catch((e) => toast.error("QR yaratib bo'lmadi", { description: e?.message }));
    return () => { alive = false; };
  }, [isOpen, rule, getToken]);

  // sweetalert queue — each newly scanned student is confirmed one at a time
  const seenRef = useRef<Set<string>>(new Set());
  const askingRef = useRef(false);
  const queueRef = useRef<QrIssueRequest[]>([]);

  useEffect(() => {
    if (!isOpen) { seenRef.current = new Set(); queueRef.current = []; askingRef.current = false; return; }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    for (const r of pending) {
      if (!seenRef.current.has(r.public_id)) {
        seenRef.current.add(r.public_id);
        queueRef.current.push(r);
      }
    }
    void processQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, isOpen]);

  async function processQueue() {
    if (askingRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    askingRef.current = true;
    try {
      // Mount inside the react-aria dialog — everything outside it is inert,
      // so a body-mounted SweetAlert would be unclickable.
      const dialogEl = (document.querySelector('[role="dialog"]') as HTMLElement) ?? document.body;
      const result = await Swal.fire({
        target: dialogEl,
        heightAuto: false,
        title: "Ball berishni tasdiqlaysizmi?",
        html: `<div style="font-size:15px;line-height:1.6">
                 <b>${next.student_name}</b>${next.university_student_id ? ` (ID: ${next.university_student_id})` : ""}<br/>
                 ${next.rule_name} — <b style="color:${next.coin_amount < 0 ? "#dc2626" : "#0072b0"}">${next.coin_amount > 0 ? "+" : ""}${next.coin_amount} ball</b>
               </div>`,
        imageUrl: toHttps(next.student_photo_url) || undefined,
        imageWidth: 96,
        imageHeight: 96,
        showCancelButton: true,
        confirmButtonText: "Tasdiqlash",
        cancelButtonText: "Keyinroq",
        confirmButtonColor: "#0072b0",
        customClass: { image: "swal-avatar" },
        didOpen: () => {
          const c = document.querySelector(".swal2-container") as HTMLElement | null;
          if (c) c.style.zIndex = "999999";
          const img = document.querySelector(".swal-avatar") as HTMLElement | null;
          if (img) { img.style.borderRadius = "999px"; img.style.objectFit = "cover"; }
        },
      });
      if (result.isConfirmed) {
        await decide({ id: next.public_id, action: "approve" });
        toast.success("Ball berildi", { description: `${next.student_name} — ${next.coin_amount > 0 ? "+" : ""}${next.coin_amount} ball` });
      }
      // dismissed → stays in the pending list below for a later decision
    } catch (e: any) {
      toast.error("Amaliyotda xatolik", { description: e?.message });
    } finally {
      askingRef.current = false;
      if (queueRef.current.length) void processQueue();
    }
  }

  async function decideRow(r: QrIssueRequest, action: "approve" | "reject") {
    try {
      await decide({ id: r.public_id, action });
      if (action === "approve") toast.success("Ball berildi", { description: r.student_name });
      else toast("Rad etildi", { description: r.student_name });
    } catch (e: any) {
      toast.error("Amaliyotda xatolik", { description: e?.message });
    }
  }

  const sortedPending = useMemo(
    () => [...pending].sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    [pending]
  );

  if (!rule) return null;

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="QR orqali ball berish"
      description={`${rule.name} — talabalar QR ni o'z ilovasidan skanerlashsin.`}
      icon={QrCode01}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <span className="text-sm text-tertiary">QR 1 soat amal qiladi</span>
          <Button color="secondary" onClick={onClose}>Yopish</Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-secondary bg-white p-3 shadow-sm">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR" className="size-56" />
          ) : (
            <div className="flex size-56 items-center justify-center text-sm text-tertiary">
              {tokenLoading ? "QR yaratilmoqda…" : "—"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-solid opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-solid" />
          </span>
          Skanerlar kutilmoqda — {rule.coin_amount > 0 ? "+" : ""}{rule.coin_amount} ball
        </div>

        {/* live pending queue */}
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-secondary">Tasdiqlash navbati</p>
            <span className="rounded-full bg-brand-solid/10 px-2.5 py-0.5 text-xs font-bold text-brand-solid">
              {sortedPending.length}
            </span>
          </div>
          {sortedPending.length === 0 ? (
            <p className="rounded-xl bg-secondary px-4 py-3 text-center text-sm text-tertiary">
              Hozircha skanerlagan talaba yo'q
            </p>
          ) : (
            <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {sortedPending.map((r) => (
                <li key={r.public_id} className="flex items-center gap-3 rounded-xl border border-secondary px-3 py-2">
                  <Avatar size="sm" src={toHttps(r.student_photo_url)} initials={(r.student_name || "T").slice(0, 2).toUpperCase()} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary">{r.student_name}</p>
                    <p className="text-xs text-tertiary">{r.university_student_id ? `ID: ${r.university_student_id}` : "Talaba"}</p>
                  </div>
                  <Button color="primary" size="sm" iconLeading={Check} isDisabled={deciding} onClick={() => decideRow(r, "approve")} aria-label="Tasdiqlash" />
                  <Button color="tertiary-destructive" size="sm" iconLeading={XIcon} isDisabled={deciding} onClick={() => decideRow(r, "reject")} aria-label="Rad etish" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PremiumFormModal>
  );
}
