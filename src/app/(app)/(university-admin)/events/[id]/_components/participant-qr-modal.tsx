'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X } from '@untitledui/icons';
import type { EventRegistration } from '@/types/events';

/** Shows ONE participant's personal QR so the organizer can present it on
 * screen — the student scans it from their own app to self-confirm attendance.
 * Staff never mark attendance manually; this is the only path. */
export function ParticipantQrModal({
  registration,
  onClose,
}: {
  registration: EventRegistration;
  onClose: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const token = registration.attendance_token;
  const name = registration.student.get_full_name;

  useEffect(() => {
    let alive = true;
    if (token) {
      QRCode.toDataURL(token, { margin: 1, width: 520, errorCorrectionLevel: 'M', color: { dark: '#0d1b2a', light: '#ffffff' } })
        .then((url) => { if (alive) setQr(url); })
        .catch(() => {});
    }
    return () => { alive = false; };
  }, [token]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-brand-solid px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white">Davomat QR kodi</h2>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg hover:bg-white/15" aria-label="Yopish">
            <X className="size-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-6">
          <div className="text-center">
            <p className="text-base font-bold text-primary">{name}</p>
            <p className="text-xs text-tertiary">{registration.student.email}</p>
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-secondary shadow-sm">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Davomat QR" className="size-56" />
            ) : (
              <div className="size-56 rounded-lg bg-secondary skeleton-shimmer" />
            )}
          </div>

          <p className="max-w-xs text-center text-sm leading-relaxed text-tertiary">
            Talaba o'z <span className="font-semibold text-secondary">Univibe ilovasidan</span> ushbu QR kodni skaner qilib davomatini o'zi tasdiqlaydi. Tasdiqlangach holat avtomatik yangilanadi.
          </p>
        </div>
      </div>
    </div>
  );
}
