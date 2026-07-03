"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RefreshCcw01, ArrowLeft, HomeLine, AlertTriangle } from "@untitledui/icons";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Button } from "@/components/base/buttons/button";
import { isForbiddenError } from "@/lib/api/errors";
import { ForbiddenState } from "@/components/application/forbidden-state/forbidden-state";

const CARD_SHADOW =
  "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => { void error; }, [error]);

  // A 403 is an authorization outcome, not a failure — show the dedicated
  // ForbiddenState (which brings its own header/illustration) instead.
  if (isForbiddenError(error)) {
    return <ForbiddenState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header stays put so the page never feels "blanked out" on error. */}
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Xatolik" },
        ]}
        title="Xatolik yuz berdi"
        subtitle="Sahifani yuklab bo'lmadi. Qayta urinib ko'ring yoki boshqa sahifaga o'ting."
        icon={AlertTriangle}
      />

      <div
        className={`flex flex-col items-center justify-center rounded-2xl bg-primary ring-1 ring-secondary ${CARD_SHADOW} px-6 py-14 sm:py-16`}
      >
        <Image
          src="/svgs/error.svg"
          alt=""
          width={260}
          height={260}
          priority
          unoptimized
          className="mb-8 h-auto w-[200px] sm:w-[260px]"
        />

        <div className="max-w-md space-y-2 text-center">
          <h2 className="text-xl font-bold text-primary sm:text-2xl">
            Nimadir xato ketdi
          </h2>
          <p className="text-sm leading-relaxed text-tertiary">
            Ma&apos;lumotlarni yuklashda kutilmagan xatolik yuz berdi. Bu vaqtincha
            muammo bo&apos;lishi mumkin — qayta urinib ko&apos;ring. Agar takrorlansa,
            biroz keyinroq urinib ko&apos;ring.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            color="primary"
            size="lg"
            iconLeading={RefreshCcw01}
            onClick={() => reset()}
          >
            Qayta urinish
          </Button>
          <Button
            color="secondary"
            size="lg"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
          >
            Ortga
          </Button>
          <Button
            color="secondary"
            size="lg"
            iconLeading={HomeLine}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
