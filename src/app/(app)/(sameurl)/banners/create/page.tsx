import { constructMetadata } from "@/lib/utils/seo";
import BannerCreatePage from "./banner-create-page";

export const metadata = constructMetadata({
  title: "Banner yaratish",
  description: "Universitet uchun yangi banner yarating.",
});

export default function Page() {
  return <BannerCreatePage />;
}
