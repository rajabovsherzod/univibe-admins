/**
 * event-poster-pdf.tsx — Single A4 page poster
 *
 * Layout:
 *   ┌──────────────────────────────────────┐
 *   │  HEADER  brand bar (#0072b0)          │
 *   ├──────────────────────────────────────┤
 *   │  TOP BODY  event info (centered)      │
 *   ├──────────────────────────────────────┤
 *   │  LEFT: illustration │ RIGHT: QR code  │
 *   ├──────────────────────────────────────┤
 *   │  FOOTER                               │
 *   └──────────────────────────────────────┘
 */
import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer';

// ── Brand colors (actual Univibe primary) ────────────────────────────────────
const BRAND  = '#0072b0';   // brand-600 / primary
const BRAND_LIGHT = '#e6f3f9'; // brand-50 equivalent
const DARK   = '#101828';
const MID    = '#344054';
const MUTED  = '#667085';
const FAINT  = '#98A2B3';
const LINE   = '#EAECF0';
const BG     = '#F9FAFB';
const WHITE  = '#FFFFFF';

const s = StyleSheet.create({
  page: { backgroundColor: WHITE, flexDirection: 'column' },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: BRAND,
    paddingVertical: 16,
    paddingHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 66,
  },
  hLeft:  { flexDirection: 'row', alignItems: 'center' },
  hIcon:  { width: 34, height: 34, marginRight: 10 },
  hTitle: { fontSize: 22, color: WHITE, fontFamily: 'Helvetica-Bold', letterSpacing: -0.3 },
  hBadge: {
    fontSize: 12, color: 'rgba(255,255,255,0.82)',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },

  // ── Top body ────────────────────────────────────────────────────────────────
  topBody: {
    paddingHorizontal: 44,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: LINE,
  },
  eventLabel: {
    fontSize: 10, color: FAINT, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
  },
  eventTitle: {
    fontSize: 28, color: DARK, fontFamily: 'Helvetica-Bold',
    lineHeight: 1.3, textAlign: 'center', marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 44 },
  infoCol: { alignItems: 'center' },
  infoLabel: {
    fontSize: 9, color: FAINT, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5,
  },
  infoValue: { fontSize: 13, color: MID, fontFamily: 'Helvetica-Bold' },

  // ── Bottom half ──────────────────────────────────────────────────────────────
  bottomHalf: { flex: 1, flexDirection: 'row' },

  illPanel: {
    flex: 1,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRightWidth: 1.5,
    borderRightColor: LINE,
  },
  illImage:   { width: 200, height: 200 },
  illCaption: {
    marginTop: 12, fontSize: 10, color: BRAND,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center', lineHeight: 1.5,
  },

  qrPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  qrImage: { width: 210, height: 210 },
  qrTitle: {
    fontSize: 13, color: DARK, fontFamily: 'Helvetica-Bold',
    textAlign: 'center', lineHeight: 1.4,
  },
  qrSub: {
    fontSize: 10, color: MUTED, textAlign: 'center',
    lineHeight: 1.5, maxWidth: 200,
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: LINE,
    paddingVertical: 10, paddingHorizontal: 36,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    height: 40,
  },
  footerText: { fontSize: 9, color: FAINT },
  footerUrl:  { fontSize: 9, color: BRAND, maxWidth: 400 },
});

// ── Translations (safe ASCII/Latin for Helvetica fallback) ───────────────────
const DICT = {
  uz: {
    badge:     'Davomat kodi',
    eventLbl:  'Tadbir',
    dateTime:  'Sana va vaqt',
    location:  'Manzil',
    qrTitle:   'Telefon kamerasini tuting',
    qrSub:     "Univibe ilovangiz orqali davomatingizni tasdiqlang",
    illCaption:"Davomatni tasdiqlash uchun\nQR kodni skanerlang",
    footer:    "Univibe – Talabalar platformasi",
  },
  ru: {
    badge:     'Kod poseshchaemosti',
    eventLbl:  'Meropriyatie',
    dateTime:  'Data i vremya',
    location:  'Mesto',
    qrTitle:   'Navedite kameru telefona na kod',
    qrSub:     'Podtverdite poseshchaemost cherez Univibe',
    illCaption:"Otscaniruyte QR-kod dlya\npodtverzhdeniya poseshchaemosti",
    footer:    'Univibe – Studencheskaya platforma',
  },
  en: {
    badge:     'Attendance Code',
    eventLbl:  'Event',
    dateTime:  'Date & Time',
    location:  'Location',
    qrTitle:   'Point your phone camera at the QR code',
    qrSub:     'Confirm your attendance via Univibe app',
    illCaption:"Scan the QR code to\nconfirm your attendance",
    footer:    'Univibe – Student Platform',
  },
};

function fmt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface PosterProps {
  eventId:    string;
  eventTitle: string;
  startTime:  string;
  endTime:    string;
  location:   string;
  lang:       'uz' | 'ru' | 'en';
}

export function EventPosterDocument({
  eventId, eventTitle, startTime, endTime, location, lang,
}: PosterProps) {
  const t = DICT[lang];

  const BASE         = typeof window !== 'undefined' ? window.location.origin : '';
  const STUDENT_BASE = process.env.NEXT_PUBLIC_STUDENT_APP_URL ?? 'https://student.univibe.uz';

  const attendUrl = `${STUDENT_BASE}/events/${eventId}/check-in`;
  const qrApiUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&ecc=M&data=${encodeURIComponent(attendUrl)}`;
  const iconUrl   = `${BASE}/icon-white.svg`;
  const illUrl    = `${BASE}/svgs/qr-code.svg`;

  return (
    <Document title={`${eventTitle} – ${t.badge}`} author="Univibe">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.hLeft}>
            <Image src={iconUrl} style={s.hIcon} />
            <Text style={s.hTitle}>Univibe</Text>
          </View>
          <Text style={s.hBadge}>{t.badge}</Text>
        </View>

        {/* Top body */}
        <View style={s.topBody}>
          <Text style={s.eventLabel}>{t.eventLbl}</Text>
          <Text style={s.eventTitle}>{eventTitle}</Text>
          <View style={s.infoRow}>
            <View style={s.infoCol}>
              <Text style={s.infoLabel}>{t.dateTime}</Text>
              <Text style={s.infoValue}>{fmt(startTime)} – {fmt(endTime)}</Text>
            </View>
            {location ? (
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>{t.location}</Text>
                <Text style={s.infoValue}>{location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Bottom half */}
        <View style={s.bottomHalf}>
          <View style={s.illPanel}>
            <Image src={illUrl} style={s.illImage} />
            <Text style={s.illCaption}>{t.illCaption}</Text>
          </View>
          <View style={s.qrPanel}>
            <Image src={qrApiUrl} style={s.qrImage} />
            <Text style={s.qrTitle}>{t.qrTitle}</Text>
            <Text style={s.qrSub}>{t.qrSub}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>{t.footer}</Text>
          <Text style={s.footerUrl}>{attendUrl}</Text>
        </View>

      </Page>
    </Document>
  );
}
