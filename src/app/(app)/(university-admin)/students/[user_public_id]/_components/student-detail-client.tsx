"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { toHttps } from "@/utils/cx";
import type { StudentStatus } from "@/lib/api/types";
import { Pencil01, Trash01 } from "@untitledui/icons";
import { useDeleteStudent } from "@/hooks/api/use-students";
import { useState } from "react";
import { Modal, Dialog, ModalOverlay, DialogTrigger } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { Trash01 as TrashIcon } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";

interface Props {
  userId: string;
}

const statusMap: Record<StudentStatus, { label: string; color: "success" | "error" | "warning" }> = {
  approved: { label: "Tasdiqlangan", color: "success" },
  rejected: { label: "Rad etilgan", color: "error" },
  waited: { label: "Kutilmoqda", color: "success" },
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
  const router = useRouter();

  const fullName = student
    ? [student.name, student.middle_name, student.surname].filter(Boolean).join(" ")
    : "";

  const initials = fullName
    ? fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "T";

  const status = student?.status ? statusMap[student.status] : null;

  const formatDate = (iso?: string) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  const handleEdit = () => {
    window.location.href = `/students/${userId}/edit`;
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const deleteStudent = useDeleteStudent();

  const handleDelete = () => {
    setConfirmName("");
    setShowDeleteModal(true);
  };

  const studentFullName = student 
    ? [student.name, student.middle_name, student.surname].filter(Boolean).join(" ")
    : "";
  
  const isMatching = confirmName.trim() === studentFullName;

  const confirmDelete = async () => {
    if (!isMatching) return;
    try {
      await deleteStudent.mutateAsync(userId);
      toast.success("Talaba muvaffaqiyatli o'chirildi!");
      setConfirmName("");
      setShowDeleteModal(false);
      router.push("/students");
    } catch (err: any) {
      toast.error("Xatolik yuz berdi", { description: err.message });
    }
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
    <>
      <div className="flex flex-col gap-6">
      {/* Page header */}
      <PageHeaderPro
        title="Talaba ma'lumotlari"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Talabalar", href: "/students" },
          { label: student?.name || "Bekorga yuklanmoqda..." },
        ]}
      />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Profile photo section - Always render */}
          <SectionCard title="Profil rasmi" className="shadow-md">
            <div className="p-5 flex flex-col items-center gap-4">
              {isPending ? (
                <>
                  <div className="size-24 rounded-full skeleton-shimmer ring-1 ring-secondary" />
                  <div className="h-5 w-36 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-28 rounded-md skeleton-shimmer" />
                  <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                </>
              ) : student ? (
                <>
                  <AvatarProfilePhoto
                    size="md"
                    src={toHttps(student?.profile_photo_url)}
                    initials={initials}
                  />

                  <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="text-base font-semibold text-primary leading-snug">
                      {fullName || "Ism ko'rsatilmagan"}
                    </h2>

                    {student?.email && (
                      <p className="text-sm text-tertiary">{student.email}</p>
                    )}

                    {status && (
                      <BadgeWithDot color={status.color} size="sm">
                        {status.label}
                      </BadgeWithDot>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </SectionCard>

          {/* Tizim ma'lumotlari - Always render */}
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
                icon={User01}
                label="Status"
                value={student?.status === 'approved' ? 'Tasdiqlangan' : student?.status === 'rejected' ? 'Rad qilingan' : 'Kutilmoqda'}
                isLoading={isPending}
                skeletonWidth="w-32"
              />
            </div>
          </SectionCard>

          {/* Harakatlar section - Always render, buttons disabled when loading */}
          <SectionCard title="Harakatlar" className="shadow-md">
            <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">
              <Button
                color="primary"
                size="md"
                iconLeading={Pencil01}
                onClick={handleEdit}
                isDisabled={!student || isPending}
                isLoading={isPending}
                className="flex-1 sm:flex-none"
              >
                Tahrirlash
              </Button>
              <Button
                color="primary-destructive"
                size="md"
                iconLeading={Trash01}
                onClick={handleDelete}
                isDisabled={!student || isPending}
                isLoading={isPending}
                className="flex-1 sm:flex-none"
              >
                O'chirish
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard title="Shaxsiy ma'lumotlar" className="shadow-md">
            <div className="px-5 py-2">
              <InfoRow icon={User01} label="Ism" value={student?.name} isLoading={isPending} skeletonWidth="w-28" />
              <InfoRow icon={User01} label="Familiya" value={student?.surname} isLoading={isPending} skeletonWidth="w-32" />
              <InfoRow icon={User01} label="Otasining ismi" value={student?.middle_name} isLoading={isPending} skeletonWidth="w-36" />
              <InfoRow icon={Calendar} label="Tug'ilgan sana" value={formatDate(student?.date_of_birth)} isLoading={isPending} skeletonWidth="w-44" />
              <InfoRow icon={Phone01} label="Telefon raqam" value={student?.contact_phone_number} isLoading={isPending} skeletonWidth="w-36" />
              <InfoRow icon={Mail01} label="Elektron pochta" value={student?.email} isLoading={isPending} skeletonWidth="w-48" />
            </div>
          </SectionCard>

          <SectionCard title="Akademik ma'lumotlar" className="shadow-md">
            <div className="px-5 py-2">
              <InfoRow icon={GraduationHat01} label="Fakultet" value={student?.faculty_name} isLoading={isPending} skeletonWidth="w-52" />
              <InfoRow icon={BookOpen01} label="Ta'lim darajasi" value={student?.degree_level_name} isLoading={isPending} skeletonWidth="w-28" />
              <InfoRow icon={BookOpen01} label="O'quv yili" value={student?.year_level_name} isLoading={isPending} skeletonWidth="w-20" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    {showDeleteModal && (
      <PremiumFormModal
        isOpen={showDeleteModal}
        onOpenChange={(v) => {
          if (!v) {
            setConfirmName("");
            setShowDeleteModal(false);
          }
        }}
        title="Talabani o'chirish"
        description="Bu amalni qaytarib bo'lmaydi."
        icon={TrashIcon}
        iconBgClassName="bg-error-solid"
        iconClassName="text-white"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button 
              color="secondary" 
              size="md" 
              onClick={() => setShowDeleteModal(false)} 
              isDisabled={deleteStudent.isPending}
              className="flex-1 sm:flex-none"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={confirmDelete}
              color="primary-destructive"
              size="md"
              isDisabled={!isMatching || deleteStudent.isPending}
              isLoading={deleteStudent.isPending}
              className="flex-1 sm:flex-none"
            >
              O&apos;chirish
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
            <p className="text-sm text-secondary">
              Haqiqatan ham <strong className="font-semibold text-primary">«{studentFullName}»</strong> ismli talabani o&apos;chirmoqchimisiz?
              Tizimdagi bu ma&apos;lumot butunlay o&apos;chib ketadi.
            </p>
          </div>

          <Input
            label="Tasdiqlash uchun talaba ismini kiriting"
            placeholder={studentFullName}
            value={confirmName}
            onChange={setConfirmName}
            autoFocus
          />
        </div>
      </PremiumFormModal>
    )}
  </>
);
}
