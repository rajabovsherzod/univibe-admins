"use client";

import * as React from "react";
import { X } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/buttons/button";
import { ModalOverlay, Modal, Dialog } from "react-aria-components";

type Size = "sm" | "md" | "lg";

export type PremiumFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  icon?: React.ElementType;

  // ✅ SEN ISHLATAYOTGAN PROPS (oldin type’da yo‘q edi)
  iconBgClassName?: string;
  iconClassName?: string;

  size?: Size;

  footer?: React.ReactNode;
  children: React.ReactNode;

  /**
   * ✅ MUHIM: Modal qayerga portal bo‘lishini boshqaramiz.
   * Agar bermasang: #app-shell -> body fallback
   */
  portalContainer?: Element | null;
};

const sizes: Record<Size, string> = {
  sm: "max-w-[440px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
};

export function PremiumFormModal({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconBgClassName = "bg-brand-secondary",
  iconClassName = "text-brand-secondary",
  size = "md",
  footer,
  children,
  portalContainer,
}: PremiumFormModalProps) {
  const [container, setContainer] = React.useState<Element | null>(null);

  React.useEffect(() => {
    // ✅ Theme bor wrapperga portal qilamiz (shunda ring rangi ham bir xil bo‘ladi)
    const shell =
      portalContainer ??
      document.getElementById("app-shell") ??
      document.body;

    setContainer(shell);
  }, [portalContainer]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      // ✅ Trigger bosilganda “outside click” deb yopilib ketmasin
      shouldCloseOnInteractOutside={(el) => !el.closest("[data-modal-trigger]")}
      // ✅ ASOSIY FIX: portal body emas, app-shell
      UNSTABLE_portalContainer={container ?? undefined}
      className={({ isEntering, isExiting }) =>
        cx(
          "fixed inset-0 z-50",
          "bg-overlay/60 backdrop-blur-sm",
          "flex items-end justify-center p-4 sm:items-center sm:p-6",
          "outline-none",
          isEntering && "animate-in fade-in",
          isExiting && "animate-out fade-out"
        )
      }
    >
      <Modal
        className={({ isEntering, isExiting }) =>
          cx(
            "w-full",
            sizes[size],
            // card
            "rounded-2xl bg-card-primary",
            "shadow-xl ring-1 ring-primary ring-inset",
            "outline-none",
            // motion
            isEntering && "animate-in zoom-in-95 slide-in-from-bottom-2 sm:slide-in-from-bottom-0",
            isExiting && "animate-out zoom-out-95 slide-out-to-bottom-2 sm:slide-out-to-bottom-0"
          )
        }
      >
        <Dialog
          aria-label={title}
          className={cx(
            "flex w-full flex-col",
            "outline-none"
          )}
        >
          {/* HEADER */}
          <div className="flex items-start gap-4 border-b border-secondary p-5">
            {Icon ? (
              <div
                className={cx(
                  "mt-0.5 flex size-11 items-center justify-center rounded-xl ring-1 ring-primary ring-inset",
                  iconBgClassName
                )}
              >
                <Icon className={cx("size-5", iconClassName)} />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-primary">
                    {title}
                  </h2>
                  {description ? (
                    <p className="mt-1 text-sm text-tertiary">
                      {description}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  color="secondary"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-5">{children}</div>

          {/* FOOTER */}
          {footer ? (
            <div className="border-t border-secondary p-5">
              {footer}
            </div>
          ) : null}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
