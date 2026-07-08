'use client';

import { useParams } from 'next/navigation';
import { useAdminEventDetail } from '@/hooks/api/use-events-admin';
import { CreateEventClient } from '../../create/_components/create-event-client';

/** Form-shaped skeleton — keeps the layout, only the dynamic fields shimmer. */
function EditEventSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      {/* header */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-secondary" />
        <div className="h-7 w-56 rounded-lg bg-secondary" />
      </div>

      {/* form card */}
      <div className="flex flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        {/* banner */}
        <div className="h-44 w-full rounded-xl bg-secondary" />

        {/* field grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-secondary" />
              <div className="h-10 w-full rounded-lg bg-secondary" />
            </div>
          ))}
        </div>

        {/* description */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-28 rounded bg-secondary" />
          <div className="h-24 w-full rounded-lg bg-secondary" />
        </div>

        {/* actions */}
        <div className="flex justify-end gap-3 pt-2">
          <div className="h-10 w-24 rounded-lg bg-secondary" />
          <div className="h-10 w-32 rounded-lg bg-brand-solid/30" />
        </div>
      </div>
    </div>
  );
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: event, isLoading } = useAdminEventDetail(id);

  if (isLoading || !event) {
    return <EditEventSkeleton />;
  }

  return <CreateEventClient initialEvent={event} />;
}
