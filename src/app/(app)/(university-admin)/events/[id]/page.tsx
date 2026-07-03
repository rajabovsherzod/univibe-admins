import { constructMetadata } from "@/lib/utils/seo";
import { EventDetailClient } from "./_components/event-detail-client";

export const metadata = constructMetadata({
  title: "Event Tafsilotlari",
  description: "Universitet eventi haqida ma'lumot va qatnashchilar.",
});

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EventDetailClient eventId={id} />;
}
