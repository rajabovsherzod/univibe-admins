'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/base/buttons/button';
import { DownloadCloud02, Image01, Expand01, X } from '@untitledui/icons';
import { toPng } from 'html-to-image';
import NextImage from 'next/image';
import { QRCode } from '@/components/shared-assets/qr-code';

const STUDENT_BASE = process.env.NEXT_PUBLIC_STUDENT_APP_URL ?? 'https://student.univibe.uz';

interface Props {
  eventId:    string;
  eventTitle?: string;
  startTime?:  string;
  endTime?:    string;
  location?:   string;
}

type Lang = 'uz' | 'ru' | 'en';

const DICT = {
  uz: {
    badge:     'Davomat kodi',
    scanTitle: 'Telefon kamerasini QR kodga tuting',
    scanSub:   'Univibe ilovangiz orqali davomatingizni bir soniyada tasdiqlang',
    dateTime:  'Sana va vaqt',
    location:  'Manzil',
    footer:    'Univibe – Talabalar platformasi',
  },
  ru: {
    badge:     'Код посещаемости',
    scanTitle: 'Наведите камеру телефона на QR-код',
    scanSub:   'Подтвердите посещаемость за секунду через приложение Univibe',
    dateTime:  'Дата и время',
    location:  'Место проведения',
    footer:    'Univibe – Студенческая платформа',
  },
  en: {
    badge:     'Attendance Code',
    scanTitle: 'Point your phone camera at the QR code',
    scanSub:   'Confirm your attendance in one second via Univibe app',
    dateTime:  'Date & Time',
    location:  'Location',
    footer:    'Univibe – Student Platform',
  },
};

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).replace(',', '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Fullscreen Projector Mode
// ─────────────────────────────────────────────────────────────────────────────
interface FullscreenProps {
  lang:       Lang;
  eventTitle: string;
  startTime:  string;
  endTime:    string;
  location:   string;
  attendUrl:  string;
  qrApiUrl:   string;
  onClose:    () => void;
}

function FullscreenProjector({
  lang, eventTitle, startTime, endTime, location, attendUrl, qrApiUrl, onClose,
}: FullscreenProps) {
  const t = DICT[lang];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col select-none">

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center text-primary ring-1 ring-secondary shadow-sm"
      >
        <X className="w-4 h-4" />
      </button>

      {/* ── Header: brand bar ────────────────────────────────────────── */}
      <div className="bg-brand-600 flex justify-between items-center shrink-0 px-4 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <NextImage src="/icon-white.svg" alt="Univibe" width={36} height={36} className="shrink-0 sm:w-11 sm:h-11" />
          <span className="text-white text-lg sm:text-2xl font-bold tracking-tight">Univibe</span>
        </div>
        <span className="text-white/80 text-[10px] sm:text-sm font-bold uppercase tracking-[0.12em] ml-2 shrink-0">
          {t.badge}
        </span>
      </div>

      {/* ── Top body: event info (centered) ──────────────────────────── */}
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-8 flex flex-col items-center text-center border-b border-secondary shrink-0">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary mb-2">Tadbir</p>
        <h1 className="text-primary text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6 max-w-3xl">{eventTitle}</h1>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">{t.dateTime}</p>
            <p className="text-secondary font-semibold text-sm sm:text-lg">{fmt(startTime)} – {fmt(endTime)}</p>
          </div>
          {location && (
            <div className="text-center">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">{t.location}</p>
              <p className="text-secondary font-semibold text-sm sm:text-lg">{location}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom half: illustration left | QR right ─────────────────── */}
      <div className="flex-1 flex min-h-0">
        {/* Left: illustration on brand-light bg */}
        <div className="flex-1 bg-brand-50 flex flex-col items-center justify-center gap-3 sm:gap-5 p-4 sm:p-8 border-r border-secondary overflow-hidden">
          <NextImage
            src="/svgs/qr-code.svg"
            alt="QR illustration"
            width={200}
            height={200}
            className="w-28 h-28 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
          />
          <p className="text-brand-600 text-xs sm:text-sm font-bold text-center max-w-xs leading-relaxed">
            {t.scanSub}
          </p>
        </div>

        {/* Right: QR code + instruction */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-5 p-4 sm:p-8 overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 ring-1 ring-secondary shadow-md">
            <NextImage
              src={qrApiUrl}
              alt="QR kod"
              width={220}
              height={220}
              className="w-28 h-28 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
              unoptimized
              crossOrigin="anonymous"
            />
          </div>
          <div className="text-center">
            <p className="text-primary text-sm sm:text-lg font-bold mb-1">{t.scanTitle}</p>
            <p className="text-tertiary text-xs sm:text-sm max-w-xs leading-relaxed">{t.scanSub}</p>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="bg-secondary/30 border-t border-secondary px-4 sm:px-10 py-2.5 flex justify-between items-center shrink-0">
        <span className="text-tertiary text-xs">{t.footer}</span>
        <span className="text-brand-600 text-xs truncate max-w-[40%]">{attendUrl}</span>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PNG Poster node (hidden, used for html-to-image capture only)
// ─────────────────────────────────────────────────────────────────────────────
interface PosterNodeProps {
  lang:       Lang;
  eventTitle: string;
  startTime:  string;
  endTime:    string;
  location:   string;
  attendUrl:  string;
  qrApiUrl:   string;
  innerRef:   React.RefObject<HTMLDivElement>;
}

function PosterNode({ lang, eventTitle, startTime, endTime, location, attendUrl, qrApiUrl, innerRef }: PosterNodeProps) {
  const t = DICT[lang];
  return (
    // A4 at 96dpi = 794 × 1123 px
    <div
      ref={innerRef}
      style={{
        position: 'fixed', left: '-9999px', top: 0,
        width: '794px', height: '1123px',
        backgroundColor: '#fff',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ background: '#1570EF', padding: '40px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-white.svg" alt="logo" style={{ width: 52, height: 52 }} />
          <span style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>Univibe</span>
        </div>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '6px 18px', borderRadius: 40, border: '1px solid rgba(255,255,255,0.3)' }}>
          {t.badge}
        </span>
      </div>

      {/* Top: Event info (centered) */}
      <div style={{ padding: '52px 64px 36px', textAlign: 'center', borderBottom: '1.5px solid #EAECF0' }}>
        <p style={{ color: '#1570EF', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Tadbir</p>
        <h1 style={{ color: '#101828', fontSize: 40, fontWeight: 800, lineHeight: 1.2, margin: '0 0 28px' }}>{eventTitle}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 56 }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: '#98a2b3', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{t.dateTime}</p>
            <p style={{ color: '#344054', fontSize: 18, fontWeight: 700 }}>{fmt(startTime)} – {fmt(endTime)}</p>
          </div>
          {location && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#98a2b3', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{t.location}</p>
              <p style={{ color: '#344054', fontSize: 18, fontWeight: 700 }}>{location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom half: illustration left, QR right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Left: illustration */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/svgs/qr-code.svg" alt="illustration" style={{ width: 260, height: 260, opacity: 0.9 }} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 240, background: '#EAECF0', flexShrink: 0 }} />

        {/* Right: QR code + instruction */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrApiUrl} alt="QR" style={{ width: 260, height: 260 }} crossOrigin="anonymous" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#101828', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t.scanTitle}</p>
            <p style={{ color: '#667085', fontSize: 12, lineHeight: 1.5, maxWidth: 240, margin: '0 auto' }}>{t.scanSub}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#F9FAFB', borderTop: '1px solid #EAECF0', padding: '14px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#98a2b3', fontSize: 11 }}>{t.footer}</span>
        <span style={{ color: '#1570EF', fontSize: 11 }}>{attendUrl}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────────────────
export function EventScannerSection({
  eventId,
  eventTitle = 'Tadbir',
  startTime  = new Date().toISOString(),
  endTime    = new Date().toISOString(),
  location   = '',
}: Props) {
  const [lang, setLang]             = useState<Lang>('uz');
  const [isPdfLoading, setIsPdf]    = useState(false);
  const [isPngLoading, setIsPng]    = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null!);
  const t = DICT[lang];

  const attendUrl = `${STUDENT_BASE}/events/${eventId}/check-in`;
  const qrApiUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&ecc=M&data=${encodeURIComponent(attendUrl)}`;

  // ── PDF ──────────────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setIsPdf(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { EventPosterDocument } = await import('./event-poster-pdf');
      const blob = await pdf(
        <EventPosterDocument
          eventId={eventId} eventTitle={eventTitle}
          startTime={startTime} endTime={endTime}
          location={location} lang={lang}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-${lang}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setIsPdf(false); }
  };

  // ── PNG (captures hidden PosterNode) ─────────────────────────────────────
  const handleDownloadPng = async () => {
    if (!posterRef.current) return;
    setIsPng(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1, pixelRatio: 2, cacheBust: true,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}-${lang}.png`;
      a.click();
    } finally { setIsPng(false); }
  };

  return (
    <>
      {/* Hidden poster node used for PNG export */}
      <PosterNode
        lang={lang} eventTitle={eventTitle} startTime={startTime}
        endTime={endTime} location={location}
        attendUrl={attendUrl} qrApiUrl={qrApiUrl}
        innerRef={posterRef}
      />

      {/* Fullscreen projector overlay */}
      {isFullscreen && (
        <FullscreenProjector
          lang={lang} eventTitle={eventTitle} startTime={startTime}
          endTime={endTime} location={location}
          attendUrl={attendUrl} qrApiUrl={qrApiUrl}
          onClose={() => setFullscreen(false)}
        />
      )}

      {/* ── Card content ─────────────────────────────────────────────────── */}
      <div className="p-6 flex flex-col sm:flex-row items-start gap-6">

        {/* QR (compact) */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="p-3 bg-white rounded-xl ring-1 ring-secondary shadow-sm">
            <QRCode
              value={attendUrl}
              size="lg"
              options={{
                dotsOptions:         { type: 'rounded',      color: '#101828' },
                cornersSquareOptions:{ type: 'extra-rounded', color: '#1570EF' },
                cornersDotOptions:   { color: '#1570EF' },
              }}
            />
          </div>
          <p className="text-[10px] text-tertiary text-center max-w-[140px] break-all leading-tight">{attendUrl}</p>
        </div>

        {/* Right: info + controls */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-primary">Davomat QR kodi</p>
            <p className="text-xs text-tertiary leading-relaxed">
              Ushbu QR kodni ekranda yoki chop etib devorga joylang. Talabalar skan qilganda davomat avtomatik tasdiqlanadi.
            </p>
          </div>

          {/* Language selector */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Poster tili</p>
            <div className="flex gap-1.5 p-1 bg-secondary rounded-lg w-fit ring-1 ring-secondary">
              {(['uz', 'ru', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                    lang === l
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-tertiary hover:text-primary'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              iconLeading={Expand01}
              color="secondary"
              onClick={() => setFullscreen(true)}
              className="ring-1 ring-secondary shadow-xs"
            >
              Ekranda ko'rsatish
            </Button>
            <Button
              size="sm"
              color="primary"
              iconLeading={DownloadCloud02}
              onClick={handleDownloadPdf}
              isLoading={isPdfLoading}
              isDisabled={isPngLoading}
            >
              PDF
            </Button>
            <Button
              size="sm"
              color="secondary"
              iconLeading={Image01}
              onClick={handleDownloadPng}
              isLoading={isPngLoading}
              isDisabled={isPdfLoading}
              className="ring-1 ring-secondary shadow-xs"
            >
              PNG
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function EventQrTab(props: Props) {
  return <EventScannerSection {...props} />;
}
