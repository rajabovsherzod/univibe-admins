'use client';

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import type { EventRegistration } from '@/types/events';

interface RasterAsset { dataUrl: string; width: number; height: number; }

/** One participant prepared for the PDF. */
export interface AttendancePdfEntry {
  name: string;
  email?: string;
  initials: string;
  qrDataUrl: string;
  avatarDataUrl?: string;
}

const PER_PAGE = 20;
const PER_COLUMN = 10;

// ── Univibe brand palette (the product blue — matches the logo #006ab0) ──────
const BRAND = '#006ab0';
const BRAND_DARK = '#004a8f';
const BRAND_TINT = '#e7f1f8';
const INK = '#0d1b2a';
const MUTED = '#5b6b7b';
const HAIRLINE = '#dbe3ea';

const styles = StyleSheet.create({
  page: { paddingBottom: 34, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },

  // Header band
  header: { backgroundColor: BRAND, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 18 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { height: 22 },
  wordmark: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff', letterSpacing: 0.2 },
  headerTag: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', letterSpacing: 1.2 },

  eventTitle: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginTop: 14, maxWidth: 400 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 8, color: '#bfe0f2', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  metaValue: { fontSize: 9.5, color: '#ffffff' },
  coinPill: {
    marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 11,
  },
  coinText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

  // Info band (light) — how-to + decorative illustration
  infoBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: BRAND_TINT, paddingVertical: 9, paddingHorizontal: 30, gap: 14,
  },
  infoText: { fontSize: 8.5, color: BRAND_DARK, flex: 1, lineHeight: 1.4 },
  infoIllustration: { height: 40 },

  // Grid
  body: { paddingHorizontal: 26, paddingTop: 14 },
  columns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1, flexDirection: 'column' },
  cell: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderWidth: 1, borderColor: HAIRLINE, borderRadius: 8,
    paddingVertical: 5, paddingHorizontal: 6, marginBottom: 5, height: 64,
  },
  qrBox: {
    width: 52, height: 52, borderWidth: 1, borderColor: HAIRLINE, borderRadius: 5,
    padding: 2, backgroundColor: '#ffffff',
  },
  qr: { width: '100%', height: '100%' },

  avatar: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: BRAND_TINT,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 30, height: 30 },
  avatarInitials: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BRAND },

  cellText: { flex: 1, flexDirection: 'column', justifyContent: 'center' },
  name: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: INK },
  email: { fontSize: 7.5, color: MUTED, marginTop: 1.5 },

  idxBadge: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center',
  },
  idxText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

  // Footer (fixed on every page)
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: HAIRLINE, paddingVertical: 8, paddingHorizontal: 30,
  },
  footerText: { fontSize: 8, color: MUTED },
  footerBrand: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BRAND },
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).replace(',', '');
  } catch {
    return '';
  }
}

export function AttendanceQrDocument({
  eventTitle,
  startTime,
  location,
  coinReward,
  entries,
  brandIcon,
  illustration,
}: {
  eventTitle: string;
  startTime?: string;
  location?: string;
  coinReward?: number;
  entries: AttendancePdfEntry[];
  brandIcon?: RasterAsset;
  illustration?: RasterAsset;
}) {
  const pages = chunk(entries, PER_PAGE);
  const total = entries.length;
  const when = formatDate(startTime);

  return (
    <Document title={`${eventTitle} — Davomat QR`} author="Univibe">
      {(pages.length ? pages : [[]]).map((pageEntries, pageIdx) => {
        const left = pageEntries.slice(0, PER_COLUMN);
        const right = pageEntries.slice(PER_COLUMN, PER_PAGE);

        const renderCol = (col: AttendancePdfEntry[], offset: number) => (
          <View style={styles.column}>
            {col.map((e, i) => {
              const globalIdx = pageIdx * PER_PAGE + offset + i + 1;
              return (
                <View key={i} style={styles.cell} wrap={false}>
                  <View style={styles.qrBox}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image style={styles.qr} src={e.qrDataUrl} />
                  </View>
                  <View style={styles.avatar}>
                    {e.avatarDataUrl ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <Image style={styles.avatarImg} src={e.avatarDataUrl} />
                    ) : (
                      <Text style={styles.avatarInitials}>{e.initials}</Text>
                    )}
                  </View>
                  <View style={styles.cellText}>
                    <Text style={styles.name}>{e.name}</Text>
                    {e.email ? <Text style={styles.email}>{e.email}</Text> : null}
                  </View>
                  <View style={styles.idxBadge}>
                    <Text style={styles.idxText}>{globalIdx}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        );

        return (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {/* Brand header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.brandRow}>
                  {brandIcon ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image
                      src={brandIcon.dataUrl}
                      style={[styles.brandIcon, { width: (brandIcon.width / brandIcon.height) * 22 }]}
                    />
                  ) : null}
                  <Text style={styles.wordmark}>Univibe</Text>
                </View>
                <Text style={styles.headerTag}>DAVOMAT · ATTENDANCE</Text>
              </View>

              <Text style={styles.eventTitle}>{eventTitle}</Text>

              <View style={styles.metaRow}>
                {when ? (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>SANA:</Text>
                    <Text style={styles.metaValue}>{when}</Text>
                  </View>
                ) : null}
                {location ? (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>MANZIL:</Text>
                    <Text style={styles.metaValue}>{location}</Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>QATNASHCHILAR:</Text>
                  <Text style={styles.metaValue}>{total}</Text>
                </View>
              </View>

              {coinReward && coinReward > 0 ? (
                <View style={styles.coinPill}>
                  <Text style={styles.coinText}>Ishtirok uchun +{coinReward} ball</Text>
                </View>
              ) : null}
            </View>

            {/* Info band: how-to text + decorative QR illustration */}
            <View style={styles.infoBand}>
              <Text style={styles.infoText}>
                Talaba o'z ilovasidan ro'yxatdan o'tgan tadbiriga kirib, shu yerdagi shaxsiy QR kodini skaner qiladi — davomat tasdiqlanadi va ball avtomatik beriladi.
              </Text>
              {illustration ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  src={illustration.dataUrl}
                  style={[styles.infoIllustration, { width: (illustration.width / illustration.height) * 40 }]}
                />
              ) : null}
            </View>

            {/* Participant QR grid */}
            <View style={styles.body}>
              <View style={styles.columns}>
                {renderCol(left, 0)}
                {renderCol(right, PER_COLUMN)}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer} fixed>
              <Text style={styles.footerBrand}>univibe.uz</Text>
              <Text style={styles.footerText}>Talabalar platformasi · Davomat ro'yxati</Text>
              <Text
                style={styles.footerText}
                render={({ pageNumber, totalPages }) => `Sahifa ${pageNumber} / ${totalPages}`}
                fixed
              />
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

// ── Asset helpers (run in the browser at generation time) ────────────────────

/** Rasterize an SVG (from /public) to a PNG data URL, preserving aspect. */
async function svgToRaster(url: string, targetHeight: number): Promise<RasterAsset | undefined> {
  try {
    const res = await fetch(url);
    const svg = await res.text();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const objUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new window.Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = objUrl;
      });
      const ratio = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const h = Math.round(targetHeight * 3); // 3x for crispness
      const w = Math.round(h * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;
      ctx.drawImage(img, 0, 0, w, h);
      return { dataUrl: canvas.toDataURL('image/png'), width: w, height: h };
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  } catch {
    return undefined;
  }
}

/** Best-effort fetch of a remote image (profile photo) to a data URL. Returns
 * undefined on any failure (CORS, 404, …) so the PDF falls back to initials. */
async function urlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

function initialsOf(first?: string, last?: string, full?: string): string {
  const a = (first || '').trim();
  const b = (last || '').trim();
  if (a || b) return `${a[0] ?? ''}${b[0] ?? ''}`.toUpperCase();
  const parts = (full || '').trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?';
}

/** Build + download the per-student attendance QR PDF. */
export async function downloadAttendanceQrPdf(
  event: { title: string; start_time?: string; location?: string | null; coin_reward?: number },
  registrations: EventRegistration[]
): Promise<number> {
  const scannable = registrations.filter(
    (r) => r.attendance_token && (r.status === 'REGISTERED' || r.status === 'ATTENDED')
  );

  // Brand assets once.
  const [brandIcon, illustration] = await Promise.all([
    svgToRaster('/icon-white.svg', 22),
    svgToRaster('/svgs/qr-code.svg', 40),
  ]);

  const entries: AttendancePdfEntry[] = await Promise.all(
    scannable.map(async (r) => {
      const s = r.student;
      const name = s.get_full_name || `${s.first_name} ${s.last_name}`.trim();
      const avatarDataUrl = s.profile_photo_url ? await urlToDataUrl(s.profile_photo_url) : undefined;
      return {
        name,
        email: s.email,
        initials: initialsOf(s.first_name, s.last_name, name),
        avatarDataUrl,
        qrDataUrl: await QRCode.toDataURL(r.attendance_token as string, {
          margin: 0,
          width: 240,
          errorCorrectionLevel: 'M',
          color: { dark: '#0d1b2a', light: '#ffffff' },
        }),
      };
    })
  );

  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(
    <AttendanceQrDocument
      eventTitle={event.title}
      startTime={event.start_time}
      location={event.location ?? undefined}
      coinReward={event.coin_reward}
      entries={entries}
      brandIcon={brandIcon}
      illustration={illustration}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}-davomat-qr.pdf`;
  a.click();
  URL.revokeObjectURL(url);

  return entries.length;
}
