import { constructMetadata } from "@/lib/utils/seo";
import { ApplicationsClient } from "./_components/applications-client";

export const metadata = constructMetadata({
  title: "Yangi talabalar",
  description: "Yangi o'quv yiliga ro'yxatdan o'tgan talabalarni tasdiqlash paneli.",
});

export default function ApplicationsPage() {
  return <ApplicationsClient />;
}
