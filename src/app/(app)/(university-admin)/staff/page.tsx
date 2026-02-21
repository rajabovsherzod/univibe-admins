import { constructMetadata } from "@/lib/utils/seo";
import StaffClientPage from "./staff-client";

export const metadata = constructMetadata({
  title: "Xodimlar",
  description: "Universitet xodimlari ro'yxati hamda ma'lumotlarini boshqarish tizimi.",
});

export default function StaffPage() {
  return <StaffClientPage />;
}