import { constructMetadata } from "@/lib/utils/seo";
import { EventsClient } from "./_components/events-client";

export const metadata = constructMetadata({
  title: "Eventlar ro'yxati",
  description: "Universitet eventlarini (tadbirlarini) boshqarish sahifasi.",
});

export default function EventsPage() {
  return <EventsClient />;
}
