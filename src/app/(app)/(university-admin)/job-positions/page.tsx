import { constructMetadata } from "@/lib/utils/seo";
import JobPositionsClientPage from "./job-positions-client";

export const metadata = constructMetadata({
  title: "Lavozimlar",
  description: "Universitetda xodimlar uchun mavjud barcha lavozimlar ro'yxati.",
});

export default function JobPositionsPage() {
  return <JobPositionsClientPage />;
}
