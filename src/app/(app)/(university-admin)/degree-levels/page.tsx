import { constructMetadata } from "@/lib/utils/seo";
import DegreeLevelsClientPage from "./_components/degree-levels-client-page";

export const metadata = constructMetadata({
  title: "Darajalar",
  description: "Bakalavriat, Magistratura va boshqa ta'lim darajalarini boshqarish.",
});

export default function DegreeLevelsPage() {
  return <DegreeLevelsClientPage />;
}
