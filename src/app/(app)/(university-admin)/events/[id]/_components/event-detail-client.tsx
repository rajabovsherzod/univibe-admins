'use client';

import { useAdminEventDetail } from '@/hooks/api/use-events-admin';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { Calendar, MarkerPin01, Users01, Clock, Shield01 } from '@untitledui/icons';
import { toHttps } from '@/utils/cx';
import Image from 'next/image';
import { EventParticipantsTab } from './event-participants-tab';
import { EventDetail } from '@/types/events';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';
import { useAdminAddCollaborator, useAdminRemoveCollaborator, useAdminApproveEvent, useAdminRejectEvent } from '@/hooks/api/use-events-admin';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Button } from '@/components/base/buttons/button';
import { Check, X } from '@untitledui/icons';
import { usePermissions } from '@/hooks/use-permissions';

const CARD_SHADOW = 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]';

function Sk({ w = 'w-32', h = 'h-4', rounded = 'rounded-md' }: {
  w?: string; h?: string; rounded?: string;
}) {
  return <div className={`${h} ${w} ${rounded} skeleton-shimmer`} />;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center bg-brand-solid px-5 py-3.5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`overflow-hidden rounded-2xl ${CARD_SHADOW} ring-1 ring-secondary`}>
      <SectionHeader title={title} />
      <div className="bg-primary">{children}</div>
    </section>
  );
}

// Label-left / value-right row
function InfoRow({ icon: Icon, label, value, isLoading, skW }: {
  icon: React.FC<any>; label: string; value?: React.ReactNode | null;
  isLoading?: boolean; skW?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-secondary last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <Icon className="size-4 text-tertiary shrink-0" />
        <p className="text-sm text-tertiary whitespace-nowrap">{label}</p>
      </div>
      <div className="text-sm font-medium text-primary text-right">
        {isLoading
          ? <Sk w={skW} />
          : (value ?? <span className="text-tertiary italic text-xs">—</span>)
        }
      </div>
    </div>
  );
}

function SectionDivider({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <span className="text-brand-600 text-base leading-none select-none">◆</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-tertiary whitespace-nowrap">
        {title}
      </span>
      {count !== undefined && (
        <span className="flex items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold px-2 py-0.5 min-w-[1.25rem]">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-secondary" />
    </div>
  );
}

const STATUS_MAP: Record<EventDetail['status'], { label: string; cls: string }> = {
  DRAFT:             { label: 'Qoralama',            cls: 'bg-utility-gray-600 text-white' },
  PENDING_APPROVAL:  { label: 'Kutilmoqda',           cls: 'bg-utility-warning-600 text-white' },
  PUBLISHED:         { label: 'Faol',                 cls: 'bg-utility-success-600 text-white' },
  REJECTED:          { label: 'Rad etilgan',          cls: 'bg-utility-error-600 text-white' },
  CANCELLED:         { label: 'Bekor qilingan',       cls: 'bg-utility-error-600 text-white' },
  COMPLETED:         { label: 'Yakunlangan',          cls: 'bg-utility-blue-600 text-white' },
};

export function EventDetailClient({ eventId }: { eventId: string }) {
  const { data: event, isLoading } = useAdminEventDetail(eventId);
  const approveMut = useAdminApproveEvent();
  const rejectMut = useAdminRejectEvent();
  const addCollabMut = useAdminAddCollaborator();
  const remCollabMut = useAdminRemoveCollaborator();
  const { can } = usePermissions();
  const canPublish = can('events.publish');
  const canManageCollaborators = can('events.collaborators');

  const [collabInput, setCollabInput] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => approveMut.mutate(eventId);
  const handleConfirmReject = () =>
    rejectMut.mutate(
      { eventId, reason: rejectReason.trim() },
      { onSuccess: () => { setRejecting(false); setRejectReason(''); } }
    );
  const approvalPending = approveMut.isPending || rejectMut.isPending;
  const handleAddCollab = () => {
    if (!collabInput) return;
    addCollabMut.mutate({ eventId, user_public_id: collabInput, role: 'CO_ORGANIZER' }, {
      onSuccess: () => setCollabInput('')
    });
  };

  const bannerSrc = event?.banner ? toHttps(event.banner) : null;
  const status    = event ? STATUS_MAP[event.status] : null;

  if (!isLoading && !event) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-tertiary">Tadbir topilmadi</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Page Header */}
      <PageHeaderPro
        title={isLoading ? 'Yuklanmoqda...' : (event?.title ?? '')}
        icon={Calendar}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tadbirlar', href: '/events' },
          { label: isLoading ? '...' : (event?.title ?? '') },
        ]}
      />

      {/* ── 1. Banner + identity (full-width) ──────────────────────── */}
      <div className={`rounded-2xl overflow-hidden border border-secondary bg-primary ${CARD_SHADOW}`}>
        <div className="relative h-44 md:h-64 overflow-hidden bg-secondary/40">
          {!isLoading && bannerSrc ? (
            <Image src={bannerSrc} alt={event?.title ?? ''} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Image src="/svgs/image.svg" alt="" width={120} height={120} className="opacity-70 w-[100px] h-[100px] md:w-[128px] md:h-[128px]" unoptimized />
              <p className="text-sm font-medium text-tertiary">Banner biriktirilmagan</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1 max-w-2xl">
            {isLoading ? (
              <><Sk w="w-56" h="h-6" rounded="rounded-lg" /><Sk w="w-80" h="h-4" /></>
            ) : (
              <>
                <h1 className="text-xl font-bold text-primary">{event?.title}</h1>
                {event?.description && (
                  <p className="text-sm text-tertiary leading-relaxed">{event.description}</p>
                )}
              </>
            )}
          </div>
          {status && (
            <span className={`inline-flex items-center self-start sm:self-center shrink-0 rounded-md font-semibold px-2.5 py-1 text-xs ${status.cls}`}>
              {status.label}
            </span>
          )}
        </div>
        
        {/* APPROVAL — plain, no amber bg/outline; just a divider + primary text */}
        {event?.status === 'PENDING_APPROVAL' && canPublish && (
          <div className="border-t border-secondary px-6 py-4">
            {!rejecting ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-medium text-primary">
                  Ushbu tadbir tasdiqlash uchun yuborilgan. Tasdiqlaysizmi yoki rad etasizmi?
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" color="secondary" onClick={() => setRejecting(true)} isDisabled={approvalPending} iconLeading={X}>
                    Rad etish
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleApprove}
                    isDisabled={approvalPending}
                    iconLeading={Check}
                    className="bg-success-solid hover:bg-success-solid_hover text-white ring-0 shadow-xs"
                  >
                    Tasdiqlash
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">Rad etish sababi</p>
                  <p className="text-xs text-tertiary">Bu sabab tadbirni yuborgan klub rahbariga ko'rsatiladi.</p>
                </div>
                <TextArea
                  placeholder="Masalan: tadbir tavsifi to'liq emas, sana mos kelmayapti..."
                  value={rejectReason}
                  onChange={setRejectReason}
                  rows={3}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" color="secondary" onClick={() => { setRejecting(false); setRejectReason(''); }} isDisabled={approvalPending}>
                    Bekor qilish
                  </Button>
                  <Button size="sm" color="primary-destructive" onClick={handleConfirmReject} isDisabled={approvalPending} isLoading={rejectMut.isPending} iconLeading={X}>
                    Rad etishni tasdiqlash
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejected → show the reason that was sent to the club leader */}
        {event?.status === 'REJECTED' && event?.rejection_reason && (
          <div className="border-t border-secondary px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">Rad etilish sababi</p>
            <p className="mt-1 text-sm text-primary">{event.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* ── 2. Event details (full-width, horizontal info rows) ─────── */}
      <Card title="Tadbir ma'lumotlari">
        {/* Horizontal 2-col grid of info rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 px-6 py-2 divide-y-0 md:gap-x-12">
          <div>
            <InfoRow
              icon={Clock}
              label="Boshlanish"
              value={event ? new Date(event.start_time).toLocaleString('uz-UZ') : null}
              isLoading={isLoading}
              skW="w-28"
            />
            <InfoRow
              icon={Clock}
              label="Tugash"
              value={event ? new Date(event.end_time).toLocaleString('uz-UZ') : null}
              isLoading={isLoading}
              skW="w-28"
            />
            <InfoRow
              icon={MarkerPin01}
              label="Lokatsiya"
              value={event?.location || null}
              isLoading={isLoading}
              skW="w-32"
            />
          </div>
          <div>
            <InfoRow
              icon={(p: any) => <CoinOutlineIcon {...p} size={16} strokeWidth={24} />}
              label="Coin mukofoti"
              value={event ? (
                <span className="inline-flex items-center gap-1 font-semibold">
                  +{event.coin_reward}
                  <CoinOutlineIcon size={13} strokeWidth={24} className="text-brand-600" />
                </span>
              ) : null}
              isLoading={isLoading}
              skW="w-16"
            />
            <InfoRow
              icon={Users01}
              label="Qatnashchilar"
              value={event ? `${event.registered_count} / ${event.participant_limit ?? '∞'}` : null}
              isLoading={isLoading}
              skW="w-20"
            />
            <InfoRow
              icon={Shield01}
              label="Tashkilotchi"
              value={event?.organizer_club_name || event?.organizer_staff_name || null}
              isLoading={isLoading}
              skW="w-28"
            />
          </div>
        </div>
      </Card>

      {/* ── 4. Collaborators ────────────────────────────────────────── */}
      <Card title="Tashkilotchilar va Yordamchilar (Collaborators)">
        <div className="px-6 py-4 flex flex-col gap-4">
          {canManageCollaborators && (
            <div className="flex items-end gap-3 max-w-lg">
              <div className="flex-1">
                <Input
                  label="Tashkilotchi (Co-Organizer) ID si"
                  placeholder="Talaba yoki xodim public_id kiriting"
                  value={collabInput}
                  onChange={setCollabInput}
                  size="md"
                />
              </div>
              <Button size="md" color="primary" onClick={handleAddCollab} isDisabled={!collabInput || addCollabMut.isPending}>
                Qo'shish
              </Button>
            </div>
          )}

          <div className="mt-2 divide-y divide-secondary border border-secondary rounded-lg overflow-hidden">
            {event?.collaborators?.length === 0 ? (
              <div className="px-4 py-3 text-sm text-tertiary">Hech kim qo'shilmagan</div>
            ) : (
              event?.collaborators?.map(c => (
                <div key={c.public_id} className="flex items-center justify-between px-4 py-3 bg-primary">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">{c.user.get_full_name}</span>
                    <span className="text-xs text-tertiary">{c.user.email} • ID: {c.user.public_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-brand-solid text-white">
                      Tashkilotchi
                    </span>
                    {canManageCollaborators && (
                      <Button
                        size="sm" color="link-destructive"
                        onClick={() => remCollabMut.mutate({ eventId, collabId: c.public_id })}
                        isDisabled={remCollabMut.isPending}
                      >
                        O'chirish
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* ── 4. Participants (full-width, grows freely) ──────────────── */}
      <div className="flex flex-col gap-2">
        <SectionDivider
          title="Qatnashchilar ro'yxati"
          count={isLoading ? undefined : event?.registered_count}
        />
        <EventParticipantsTab eventId={eventId} />
      </div>

    </div>
  );
}
