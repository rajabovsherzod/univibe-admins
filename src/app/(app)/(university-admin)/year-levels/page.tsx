import { constructMetadata } from "@/lib/utils/seo";
import YearLevelsClientPage from "./_components/year-levels-client-page";

export const metadata = constructMetadata({
  title: "Kurslar",
  description: "Universitet o'quv yil darajalarini (kurslarini) nazorat qilish paneli.",
});

export default function YearLevelsPage() {
  return <YearLevelsClientPage />;
}
