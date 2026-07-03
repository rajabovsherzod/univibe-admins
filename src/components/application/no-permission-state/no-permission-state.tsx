"use client";

import { ShieldOff } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Button } from "@/components/base/buttons/button";
import { useRouter } from "next/navigation";

interface NoPermissionStateProps {
  title?: string;
  description?: string;
}

/** Shown instead of a form/page when a staff member navigates directly to an
 * action they don't hold the permission for (e.g. via URL), so the UI never
 * renders a form they can't actually submit. */
export function NoPermissionState({
  title = "Ruxsat yo'q",
  description = "Bu amalni bajarish uchun sizda ruxsat yo'q. Kerak bo'lsa, universitet administratoriga murojaat qiling.",
}: NoPermissionStateProps) {
  const router = useRouter();

  return (
    <EmptyState size="md" className="py-16">
      <EmptyState.Header pattern="none">
        <EmptyState.FeaturedIcon icon={ShieldOff} color="error" theme="modern" />
      </EmptyState.Header>
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        <EmptyState.Description>{description}</EmptyState.Description>
      </EmptyState.Content>
      <EmptyState.Footer>
        <Button color="secondary" size="md" onClick={() => router.back()}>
          Orqaga qaytish
        </Button>
      </EmptyState.Footer>
    </EmptyState>
  );
}
