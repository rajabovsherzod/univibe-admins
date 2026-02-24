"use client";

import { PageHeaderPro } from "@/components/application/page-header/page-header-pro";
import { FileCheck02 } from "@untitledui/icons";
import { ApplicationsClient } from "./applications-client";

export function ApplicationsClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderPro
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Yangi talabalar" },
        ]}
        title="Yangi talabalar"
        subtitle="Yangi o'quv yiliga ro'yxatdan o'tgan talabalarni tasdiqlash paneli."
        icon={FileCheck02}
      />
      <div className="p-1">
        <ApplicationsClient />
      </div>
    </div>
  );
}
