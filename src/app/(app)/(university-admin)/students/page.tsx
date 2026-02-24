import { constructMetadata } from "@/lib/utils/seo";
import { StudentsClient } from "./_components/students-client";

export const metadata = constructMetadata({
  title: "Talabalar ro'yxati",
  description: "Universitet talabalarini boshqarish sahifasi.",
});

export default function StudentsPage() {
  return <StudentsClient />;
}
