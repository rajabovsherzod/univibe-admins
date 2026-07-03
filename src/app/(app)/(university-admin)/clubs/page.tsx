import { constructMetadata } from "@/lib/utils/seo";
import { ClubsClient } from "./_components/clubs-client";

export const metadata = constructMetadata({
  title: "Klublar ro'yxati",
  description: "Universitet klublarini boshqarish sahifasi.",
});

export default function ClubsPage() {
  return <ClubsClient />;
}
