"use client";

import Link from "next/link";
import {
  User01,
  Mail01,
  Phone01,
  Calendar,
  GraduationHat01,
  BookOpen01,
  Users01,
  ArrowLeft,
  CreditCard01,
  Clock,
} from "@untitledui/icons";
import { useStudentDetail } from "@/hooks/api/use-students";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { AvatarProfilePhoto } from "@/components/base/avatar/avatar-profile-photo";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { SectionCard } from "@/components/application/section-card/section-card";
import { Button } from "@/components/base/buttons/button";
import type { StudentStatus } from "@/lib/api/types";

interface Props {
  userId: string;
}

const statusMap: Record<StudentStatus, { label: string; color: "success" | "error" | "warning" }> = {
  approved: { label: "Tasdiqlangan", color: "success" },
  rejected: { label: "Rad etilgan", color: "error" },
  waited:   { label: "Kutilmoqda",   color: "warning" },
};

// ── Shimmer skeleton line ──────────────────────────────────────────────────
function SkeletonLine({ width = "w-32" }: { width?: string }) {
  return <div className={`mt-1.5 h-4 ${width} rounded-md skeleton-shimmer`} />;
}

// ── Info row — icon + label always visible, value skeletons when loading ──
function InfoRow({
  icon: Icon,
  label,
  value,
  isLoading,
  skeletonWidth,
}: {
  icon: React.FC<any>;
  label: string;
  value?: string | null;
  isLoading?: boolean;
  skeletonWidth?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-secondary last:border-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-tertiary">
        <Icon className="size-4 text-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-tertiary">{label}</p>
        {isLoading ? (
          <SkeletonLine width={skeletonWidth} />
        ) : (
          <p className="mt-0.5 text-sm font-medium text-primary truncate">
            {value || <span className="text-tertiary italic">Ko&apos;rsatilmagan</span>}
          </p>
        )}
      </div>
    </div>
  );
}

export function StudentDetailClient({ userId }: Props) {
  const { data: student, isPending, isError } = useStudentDetail(userId);

  const fullName = student
    ? [student.name, student.middle_name, student.surname].filter(Boolean).join(" ")
    : "";

  const initials = fullName
    ? fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "T";

  const status = student?.status ? statusMap[student.status] : null;

  const formatDate = (iso?: string) => {
    if (!iso) return undefined;
    return new Date(iso).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ── Error state ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-base font-medium text-primary">
          Talaba topilmadi yoki yuklashda xatolik yuz berdi.
        </p>
        <Link href="/students">
          <Button color="secondary" iconLeading={ArrowLeft} size="md">
            Ro&apos;yxatga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  // ── Main layout (both loading + loaded) ────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page header — always rendered, back button always visible */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Talabalar ro'yxati", href: "/students" },
          { label: isPending ? "Yuklanmoqda..." : (fullName || "Talaba") },
        ]}
        title={isPending
          ? <div className="h-7 w-48 rounded-md skeleton-shimmer" />
          : (fullName || "Talaba ma'lumotlari")}
        subtitle="Talabaning to'liq profil ma'lumotlari va akademik holati."
        icon={Users01}
        actions={
          <Link href="/students">
            <Button color="secondary" iconLeading={ArrowLeft} size="md">
              Ro&apos;yxatga qaytish
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── LEFT — Profile card ──────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <SectionCard title="Profil" className="shadow-md">
            <div className="flex flex-col items-center gap-4 px-5 py-6">
              {/* Avatar */}
              {isPending ? (
                <div className="size-24 rounded-full skeleton-shimmer ring-1 ring-secondary" />
              ) : (
                <AvatarProfilePhoto
                  size="md"
                  src={student?.profile_photo_url || undefined}
                  initials={initials}
                />
              )}

              <div className="flex flex-col items-center gap-2 text-center">
                {/* Name */}
                {isPending ? (
                  <div className="h-5 w-36 rounded-md skeleton-shimmer" />
                ) : (
                  <h2 className="text-base font-semibold text-primary leading-snug">
                    {fullName || "Ism ko'rsatilmagan"}
                  </h2>
                )}

                {/* Email */}
                {isPending ? (
                  <div className="h-4 w-28 rounded-md skeleton-shimmer" />
                ) : (
                  student?.email && (
                    <p className="text-sm text-tertiary">{student.email}</p>
                  )
                )}

                {/* Status badge */}
                {isPending ? (
                  <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                ) : (
                  status && (
                    <BadgeWithDot color={status.color} size="sm">
                      {status.label}
                    </BadgeWithDot>
                  )
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tizim ma'lumotlari" className="shadow-md">
            <div className="px-5 py-2">
              <InfoRow
                icon={Clock}
                label="Ro'yxatdan o'tgan"
                value={formatDate(student?.created_at)}
                isLoading={isPending}
                skeletonWidth="w-40"
              />
              <InfoRow
                icon={Clock}
                label="Yangilangan"
                value={formatDate(student?.updated_at)}
                isLoading={isPending}
                skeletonWidth="w-40"
              />
              <InfoRow
                icon={CreditCard01}
                label="Talaba ID"
                value={student?.university_student_id}
                isLoading={isPending}
                skeletonWidth="w-24"
              />
            </div>
          </SectionCard>
        </div>

        {/* ── RIGHT — Details ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard title="Shaxsiy ma'lumotlar" className="shadow-md">
            <div className="px-5 py-2">
              <InfoRow icon={User01}   label="Ism"              value={student?.name}                      isLoading={isPending} skeletonWidth="w-28" />
              <InfoRow icon={User01}   label="Familiya"         value={student?.surname}                   isLoading={isPending} skeletonWidth="w-32" />
              <InfoRow icon={User01}   label="Otasining ismi"   value={student?.middle_name}               isLoading={isPending} skeletonWidth="w-36" />
              <InfoRow icon={Calendar} label="Tug'ilgan sana"   value={formatDate(student?.date_of_birth)} isLoading={isPending} skeletonWidth="w-44" />
              <InfoRow icon={Phone01}  label="Telefon raqam"    value={student?.contact_phone_number}      isLoading={isPending} skeletonWidth="w-36" />
              <InfoRow icon={Mail01}   label="Elektron pochta"  value={student?.email}                     isLoading={isPending} skeletonWidth="w-48" />
            </div>
          </SectionCard>

          <SectionCard title="Akademik ma'lumotlar" className="shadow-md">
            <div className="px-5 py-2">
              <InfoRow icon={GraduationHat01} label="Fakultet"        value={student?.faculty_name}      isLoading={isPending} skeletonWidth="w-52" />
              <InfoRow icon={BookOpen01}      label="Ta'lim darajasi" value={student?.degree_level_name} isLoading={isPending} skeletonWidth="w-28" />
              <InfoRow icon={BookOpen01}      label="O'quv yili"      value={student?.year_level_name}   isLoading={isPending} skeletonWidth="w-20" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
