'use client';

import { useParams } from 'next/navigation';
import { useAdminEventDetail } from '@/hooks/api/use-events-admin';
import { CreateEventClient } from '../../create/_components/create-event-client';

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: event, isLoading } = useAdminEventDetail(id);

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-tertiary">Yuklanmoqda...</p>
      </div>
    );
  }

  return <CreateEventClient initialEvent={event} />;
}
