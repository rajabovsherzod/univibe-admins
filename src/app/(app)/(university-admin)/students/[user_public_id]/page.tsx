import type { Metadata } from "next";
import { StudentDetailClient } from "./_components/student-detail-client";

export const metadata: Metadata = {
  title: "Talaba ma'lumotlari | Univibe Admin",
  robots: { index: false },
};

interface Props {
  params: Promise<{ user_public_id: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
  const { user_public_id } = await params;
  return <StudentDetailClient userId={user_public_id} />;
}
