import { constructMetadata } from "@/lib/utils/seo";
import { CreateEventClient } from "./_components/create-event-client";

export const metadata = constructMetadata({
  title: "Yangi Event Yaratish",
  description: "Universitetda yangi event (tadbir) tashkil qilish",
});

export default function CreateEventPage() {
  return <CreateEventClient />;
}
