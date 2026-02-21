import { constructMetadata } from "@/lib/utils/seo";
import { FacultiesClientPage } from "./_components/faculties-client-page";

export const metadata = constructMetadata({
  title: "Fakultetlar",
  description: "Universitet filiallari va fakultetlarini boshqarish bo'limi.",
});

export default function FacultiesPage() {
  return <FacultiesClientPage />;
}
