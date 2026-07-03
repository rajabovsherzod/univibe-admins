"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, HomeLine, Lock01 } from "@untitledui/icons";
import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { Button } from "@/components/base/buttons/button";

interface ForbiddenStateProps {
  title?: string;
  description?: string;
  /** Show the page header. Off when the caller already renders its own. */
  withHeader?: boolean;
}

const CARD_SHADOW =
  "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.1)]";

/** Shown when access to a section is not granted — either the frontend gates it
 * up-front from the session (see RouteGuard) or the backend answers 403. Mirrors
 * the error state's layout (header kept, illustration, styled actions) so the
 * two feel like one coherent system. */
export function ForbiddenState({
  title = "Ruxsat berilmagan",
  description = "Ushbu bo'limga kirish uchun administratsiya tomonidan ruxsat berilmagan. Kerak bo'lsa, universitet administratoriga murojaat qiling.",
  withHeader = true,
}: ForbiddenStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      {withHeader && (
        <PageHeaderPro
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Ruxsat yo'q" },
          ]}
          title="Ruxsat berilmagan"
          subtitle="Bu bo'lim siz uchun ochiq emas."
          icon={Lock01}
        />
      )}

      <div
        className={`flex flex-col items-center justify-center rounded-2xl bg-primary ring-1 ring-secondary ${CARD_SHADOW} px-6 py-14 sm:py-16`}
      >
        <Image
          src="/svgs/forbidden.svg"
          alt=""
          width={260}
          height={260}
          unoptimized
          className="mb-8 h-auto w-[200px] sm:w-[260px]"
        />

        <div className="max-w-md space-y-2 text-center">
          <h2 className="text-xl font-bold text-primary sm:text-2xl">{title}</h2>
          <p className="text-sm leading-relaxed text-tertiary">{description}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            color="secondary"
            size="lg"
            iconLeading={ArrowLeft}
            onClick={() => router.back()}
          >
            Ortga
          </Button>
          <Button
            color="primary"
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
