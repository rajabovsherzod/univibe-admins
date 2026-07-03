'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCreateEvent, useAdminUpdateEvent } from '@/hooks/api/use-events-admin';
import { PageHeaderPro } from '@/components/application/page-header/page-header-pro';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Button } from '@/components/base/buttons/button';
import { Calendar, Save01, XClose } from '@untitledui/icons';
import { Toggle } from '@/components/base/toggle/toggle';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { DatePicker } from '@/components/application/date-picker/date-picker';
import { TimePicker } from '@/components/application/date-picker/time-picker';
import { Time, CalendarDate } from '@internationalized/date';
import { usePermissions } from '@/hooks/use-permissions';
import { NoPermissionState } from '@/components/application/no-permission-state/no-permission-state';
import type { EventDetail } from '@/types/events';

/** ISO → { date: CalendarDate, time: Time } for the pickers (edit mode). */
function isoToParts(iso?: string | null): { date: CalendarDate | null; time: Time } {
  if (!iso) return { date: null, time: new Time(10, 0) };
  const d = new Date(iso);
  return {
    date: new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
    time: new Time(d.getHours(), d.getMinutes()),
  };
}

export function CreateEventClient({ initialEvent }: { initialEvent?: EventDetail } = {}) {
  const router = useRouter();
  const isEdit = !!initialEvent;
  const createEvent = useAdminCreateEvent();
  const updateEvent = useAdminUpdateEvent();
  const { can, isLoading: permissionsLoading } = usePermissions();

  const start0 = isoToParts(initialEvent?.start_time);
  const end0 = isoToParts(initialEvent?.end_time);
  const regStart0 = isoToParts(initialEvent?.registration_start);
  const regEnd0 = isoToParts(initialEvent?.registration_end);

  const [hasLimit, setHasLimit] = useState(initialEvent?.participant_limit != null);
  const [hasRegTime, setHasRegTime] = useState(
    !!(initialEvent?.registration_start || initialEvent?.registration_end)
  );

  const [formData, setFormData] = useState({
    title: initialEvent?.title ?? '',
    description: initialEvent?.description ?? '',
    location: initialEvent?.location ?? '',
    participant_limit: initialEvent?.participant_limit != null ? String(initialEvent.participant_limit) : '',
    coin_reward: initialEvent?.coin_reward != null ? String(initialEvent.coin_reward) : '0',
    status: (initialEvent?.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED') as 'DRAFT' | 'PUBLISHED',
  });

  const [startTime, setStartTime] = useState<any>(start0.date);
  const [startHour, setStartHour] = useState<any>(start0.time);
  const [endTime, setEndTime] = useState<any>(end0.date);
  const [endHour, setEndHour] = useState<any>(end0.time);
  const [regStart, setRegStart] = useState<any>(regStart0.date);
  const [regStartHour, setRegStartHour] = useState<any>(regStart0.time);
  const [regEnd, setRegEnd] = useState<any>(regEnd0.date);
  const [regEndHour, setRegEndHour] = useState<any>(regEnd0.time);
  const [banner, setBanner] = useState<File | null>(null);

  const isPending = createEvent.isPending || updateEvent.isPending;

  const combineDateTime = (dateObj: any, timeObj: any) => {
    if (!dateObj) return undefined;
    const date = dateObj.toDate ? dateObj.toDate('Asia/Tashkent') : new Date();
    if (timeObj) {
      date.setHours(timeObj.hour, timeObj.minute, 0, 0);
    }
    return date.toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location || undefined,
      start_time: combineDateTime(startTime, startHour) || new Date().toISOString(),
      end_time: combineDateTime(endTime, endHour) || new Date().toISOString(),
      registration_start: hasRegTime ? combineDateTime(regStart, regStartHour) : undefined,
      registration_end: hasRegTime ? combineDateTime(regEnd, regEndHour) : undefined,
      participant_limit: hasLimit && formData.participant_limit ? parseInt(formData.participant_limit) : null,
      coin_reward: parseInt(formData.coin_reward) || 0,
      status: formData.status,
      banner: banner,
    };

    if (isEdit && initialEvent) {
      updateEvent.mutate(
        { eventId: initialEvent.public_id, data: payload },
        { onSuccess: () => router.push(`/events/${initialEvent.public_id}`) }
      );
    } else {
      createEvent.mutate(payload, { onSuccess: () => router.push('/events') });
    }
  };

  // Route-level guard: staff without permission may not see the form even via direct URL.
  // While permissions are still resolving, render nothing rather than flashing the form.
  if (permissionsLoading) {
    return null;
  }
  // Create needs events.create; editing needs create (own) or manage (all).
  if (isEdit ? !can('events.create') && !can('events.manage') : !can('events.create')) {
    return <NoPermissionState description="Bu amal uchun sizda ruxsat yo'q." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tadbirlar", href: "/events" },
          { label: isEdit ? "Tahrirlash" : "Yangi tadbir" },
        ]}
        title={isEdit ? "Tadbirni Tahrirlash" : "Yangi Tadbir Yaratish"}
        subtitle={isEdit ? "Tadbir tafsilotlarini yangilang." : "Talabalar uchun yangi tadbir tafsilotlarini kiriting."}
        icon={Calendar}
      />

      <div className="flex flex-col overflow-hidden rounded-2xl bg-primary shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)] ring-1 ring-secondary">
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-5">
              <Input
                label="Tadbir nomi *"
                name="title"
                value={formData.title}
                onChange={(value) => setFormData(prev => ({...prev, title: value}))}
                placeholder="Masalan: AI va Kelajak Kasblari"
                isRequired
              />

              <TextArea
                label="Tavsif *"
                name="description"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({...prev, description: value}))}
                placeholder="Tadbir haqida batafsil ma'lumot..."
                rows={4}
                isRequired
              />

              <Input
                label="O'tkazilish joyi (Lokatsiya)"
                name="location"
                value={formData.location}
                onChange={(value) => setFormData(prev => ({...prev, location: value}))}
                placeholder="Masalan: Asosiy bino, 101-xona"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-primary">Boshlanish vaqti *</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        aria-label="Boshlanish sanasi"
                        value={startTime}
                        onChange={setStartTime}
                        placeholder="Sana"
                      />
                    </div>
                    <div className="w-28">
                      <TimePicker
                        aria-label="Soat"
                        value={startHour}
                        onChange={setStartHour}
                        isRequired
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-primary">Tugash vaqti *</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DatePicker
                        aria-label="Tugash sanasi"
                        value={endTime}
                        onChange={setEndTime}
                        placeholder="Sana"
                      />
                    </div>
                    <div className="w-28">
                      <TimePicker
                        aria-label="Soat"
                        value={endHour}
                        onChange={setEndHour}
                        isRequired
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5 rounded-xl ring-1 ring-secondary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-primary">Qatnashchilar limiti</span>
                    <span className="text-sm text-tertiary">Tadbirga faqat belgilangan miqdordagi odam yozila oladi.</span>
                  </div>
                  <Toggle
                    aria-label="Qatnashchilar limiti"
                    isSelected={hasLimit}
                    onChange={(checked) => setHasLimit(checked)}
                  />
                </div>
                {hasLimit && (
                  <div className="pt-2">
                    <Input
                      type="number"
                      label="Limit soni"
                      name="participant_limit"
                      value={formData.participant_limit}
                      onChange={(value) => setFormData(prev => ({...prev, participant_limit: value}))}
                      placeholder="Masalan: 50"
                      isRequired={hasLimit}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary">Tadbir Banneri</label>
                <FileUpload.Root>
                  <FileUpload.DropZone
                    accept="image/*"
                    allowsMultiple={false}
                    onDropFiles={(files) => {
                      if (files && files.length > 0) {
                        setBanner(files[0]);
                      }
                    }}
                    hint="SVG, PNG, JPG (max. 800x400px)"
                  />
                  {banner && (
                    <FileUpload.List>
                      <FileUpload.ListItemProgressBar
                        name={banner.name}
                        size={banner.size}
                        progress={100}
                        onDelete={() => setBanner(null)}
                      />
                    </FileUpload.List>
                  )}
                </FileUpload.Root>
              </div>

              <div className="flex flex-col gap-4 p-5 rounded-xl ring-1 ring-secondary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-primary">Maxsus ro'yxatdan o'tish vaqti</span>
                    <span className="text-sm text-tertiary">Avvaldan ro'yxatdan o'tish muddatini belgilash.</span>
                  </div>
                  <Toggle
                    aria-label="Maxsus ro'yxatdan o'tish vaqti"
                    isSelected={hasRegTime}
                    onChange={(checked) => setHasRegTime(checked)}
                  />
                </div>
                {hasRegTime && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-primary">Boshlanish</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <DatePicker
                            aria-label="Ro'yxat boshlanishi"
                            value={regStart}
                            onChange={setRegStart}
                            placeholder="Sana"
                          />
                        </div>
                        <div className="w-28">
                          <TimePicker aria-label="Soat" value={regStartHour} onChange={setRegStartHour} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-primary">Tugash</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <DatePicker
                            aria-label="Ro'yxat tugashi"
                            value={regEnd}
                            onChange={setRegEnd}
                            placeholder="Sana"
                          />
                        </div>
                        <div className="w-28">
                          <TimePicker aria-label="Soat" value={regEndHour} onChange={setRegEndHour} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                type="number"
                label="Coin Rag'batlantirish"
                name="coin_reward"
                value={formData.coin_reward}
                onChange={(value) => setFormData(prev => ({...prev, coin_reward: value}))}
                placeholder="0"
                hint="Qatnashgan talabalarga qatnashganligi tasdiqlanganda shu miqdorda coin beriladi."
              />

              <Toggle
                label="Tadbirni faollashtirish (Faol / Qoralama)"
                hint="Yoqilsa, tadbir yaratilgach darhol barcha uchun e'lon qilinadi. Aks holda 'Qoralamalar' bo'limida saqlanadi."
                isSelected={formData.status === 'PUBLISHED'}
                onChange={(selected) => setFormData(prev => ({...prev, status: selected ? 'PUBLISHED' : 'DRAFT'}))}
                size="md"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              color="secondary"
              iconLeading={XClose}
              onClick={() => router.push('/events')}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              iconLeading={Save01}
              isLoading={isPending}
            >
              {isEdit ? "O'zgarishlarni saqlash" : "Tadbirni saqlash"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
