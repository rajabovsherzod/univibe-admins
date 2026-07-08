"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { QrCode01, Check, X as XIcon } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useRuleQrToken, useQrRequests, useDecideQrRequest, type QrIssueRequest } from "@/hooks/api/use-coins";
import type { CoinRule } from "@/lib/api/types";
import { cx, toHttps } from "@/utils/cx";

interface QrIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: CoinRule | null;
}

/** Shows the rule's QR full-screen for students to scan; polls the pending
 * claims and walks the staff through in-modal confirmations one by one. */
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

  // confirm queue — each newly scanned student is confirmed one at a time,
  // in-modal (everything outside the react-aria dialog is inert)
  const seenRef = useRef<Set<string>>(new Set());
  const [queue, setQueue] = useState<QrIssueRequest[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<QrIssueRequest | null>(null);

  useEffect(() => {
    if (!isOpen) {
      seenRef.current = new Set();
      setQueue([]);
      setConfirmTarget(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fresh = pending.filter((r) => !seenRef.current.has(r.public_id));
    if (!fresh.length) return;
    fresh.forEach((r) => seenRef.current.add(r.public_id));
    setQueue((q) => [...q, ...fresh]);
  }, [pending, isOpen]);

  useEffect(() => {
    if (!confirmTarget && queue.length) {
      setConfirmTarget(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [confirmTarget, queue]);

  async function confirmApprove() {
    if (!confirmTarget) return;
    const r = confirmTarget;
    try {
      await decide({ id: r.public_id, action: "approve" });
      toast.success("Ball berildi", { description: `${r.student_name} — ${r.coin_amount > 0 ? "+" : ""}${r.coin_amount} ball` });
    } catch (e: any) {
      toast.error("Amaliyotda xatolik", { description: e?.message });
    } finally {
      setConfirmTarget(null); // effect pops the next one from the queue
    }
  }

  function confirmLater() {
    // stays PENDING — remains in the live list below for a later decision
    setConfirmTarget(null);
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
        confirmTarget ? (
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              color="secondary"
              size="md"
              onClick={confirmLater}
              isDisabled={deciding}
              className="flex-1 sm:flex-none"
            >
              Keyinroq
            </Button>
            <Button
              color="primary"
              size="md"
              onClick={confirmApprove}
              isDisabled={deciding}
              isLoading={deciding}
              className="flex-1 sm:flex-none"
            >
              Tasdiqlash
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-sm font-medium text-tertiary">QR 1 soat amal qiladi</span>
            <Button color="secondary" onClick={onClose}>Yopish</Button>
          </div>
        )
      }
    >
      {confirmTarget ? (
        <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Avatar Section */}
          <div className="relative mb-5">
            <div className="absolute inset-0 -m-3 rounded-full bg-brand-solid/5 animate-pulse" />
            <div className="absolute inset-0 -m-1.5 rounded-full bg-brand-solid/10" />
            <Avatar
              size="2xl"
              src={toHttps(confirmTarget.student_photo_url)}
              initials={(confirmTarget.student_name || "T").slice(0, 2).toUpperCase()}
              className="relative ring-4 ring-white shadow-sm"
            />
          </div>
          
          <div className="flex flex-col items-center gap-1 text-center mb-8">
            <p className="text-xl font-bold text-primary">{confirmTarget.student_name}</p>
            {confirmTarget.university_student_id ? (
              <p className="text-sm font-medium text-tertiary flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-utility-gray-400" />
                ID: {confirmTarget.university_student_id}
              </p>
            ) : (
              <p className="text-sm font-medium text-tertiary">Talaba tasdiqlandi</p>
            )}
          </div>

          {/* Reward Card */}
          <div className="w-full relative overflow-hidden rounded-2xl bg-secondary border border-secondary p-5 mb-6">
            <div className="absolute -right-4 -top-4 text-utility-gray-200/50">
              <QrCode01 className="w-24 h-24" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-tertiary mb-1">
                  Qoida
                </span>
                <span className="truncate text-base font-medium text-primary">
                  {confirmTarget.rule_name}
                </span>
              </div>
              <div className={cx(
                "flex shrink-0 items-center justify-center rounded-xl px-4 py-2 font-bold text-lg",
                confirmTarget.coin_amount < 0 
                  ? "bg-utility-error-50 text-utility-error-700" 
                  : "bg-utility-success-50 text-utility-success-700"
              )}>
                {confirmTarget.coin_amount > 0 ? "+" : ""}{confirmTarget.coin_amount} ball
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-secondary">
              Ushbu talabaga ball berishni tasdiqlaysizmi?
            </p>
            {queue.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Navbatda yana {queue.length} ta talaba bor
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-2 animate-in fade-in duration-300">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center p-4 bg-white rounded-3xl border-2 border-secondary shadow-xs transition-all hover:shadow-md">
              <div className="absolute -inset-0.5 rounded-[26px] bg-gradient-to-b from-utility-gray-100 to-transparent -z-10" />
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR Code" className="size-56 object-contain rounded-xl" />
              ) : (
                <div className="flex size-56 flex-col items-center justify-center gap-3 text-tertiary rounded-xl bg-secondary/50">
                  <div className="size-8 rounded-full border-2 border-brand-solid border-t-transparent animate-spin" />
                  <span className="text-sm font-medium">QR tayyorlanmoqda...</span>
                </div>
              )}
            </div>
            
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-utility-success-200 bg-utility-success-50 px-3.5 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-utility-success-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-utility-success-600" />
              </span>
              <span className="text-sm font-semibold text-utility-success-700">
                Skanerlash kutilyapti — {rule.coin_amount > 0 ? "+" : ""}{rule.coin_amount} ball
              </span>
            </div>
          </div>

          <hr className="border-secondary" />

          {/* Live Pending Queue */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between px-1">
              <h4 className="text-sm font-semibold text-primary">Tasdiqlash navbati</h4>
              {sortedPending.length > 0 && (
                <Badge type="color" color="brand" className="font-bold">
                  {sortedPending.length} ta
                </Badge>
              )}
            </div>
            
            {sortedPending.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary bg-secondary/30 py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-xs">
                  <QrCode01 className="size-5 text-tertiary" />
                </div>
                <p className="text-sm font-medium text-tertiary">
                  Hozircha hech kim skanerlamadi
                </p>
              </div>
            ) : (
              <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto p-1 -mx-1">
                {sortedPending.map((r) => (
                  <li 
                    key={r.public_id} 
                    className="group flex items-center gap-3 rounded-2xl border border-transparent bg-white p-2.5 shadow-sm ring-1 ring-secondary transition-all hover:border-brand-200 hover:ring-brand-200 hover:shadow-md"
                  >
                    <Avatar 
                      size="md" 
                      src={toHttps(r.student_photo_url)} 
                      initials={(r.student_name || "T").slice(0, 2).toUpperCase()} 
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm font-semibold text-primary group-hover:text-brand-600 transition-colors">
                        {r.student_name}
                      </p>
                      <p className="text-xs font-medium text-tertiary">
                        {r.university_student_id ? `ID: ${r.university_student_id}` : "Talaba"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button 
                        color="tertiary" 
                        size="sm" 
                        iconLeading={Check} 
                        isDisabled={deciding} 
                        onClick={() => decideRow(r, "approve")} 
                        aria-label="Tasdiqlash" 
                        className="!text-utility-success-600 hover:!bg-utility-success-50 hover:!text-utility-success-700 hover:!ring-utility-success-200"
                      />
                      <Button 
                        color="tertiary" 
                        size="sm" 
                        iconLeading={XIcon} 
                        isDisabled={deciding} 
                        onClick={() => decideRow(r, "reject")} 
                        aria-label="Rad etish" 
                        className="!text-utility-error-600 hover:!bg-utility-error-50 hover:!text-utility-error-700 hover:!ring-utility-error-200"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </PremiumFormModal>
  );
}
