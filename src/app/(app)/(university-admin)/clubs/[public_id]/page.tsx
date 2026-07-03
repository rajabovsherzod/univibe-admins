import { Metadata } from 'next';
import { ClubDetailPageClient } from './_components/club-detail-page-client';

export const metadata: Metadata = {
  title: 'Klub haqida',
  description: 'Klub ma\'lumotlari va a\'zolari',
};

interface PageProps {
  params: Promise<{
    public_id: string;
  }>;
}

export default async function ClubDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ClubDetailPageClient publicId={resolvedParams.public_id} />;
}
