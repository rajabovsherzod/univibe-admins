"use client";

import * as React from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { XClose } from "@untitledui/icons";
import { cx } from "@/utils/cx";

type Size = "sm" | "md" | "lg";

export type PremiumFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  icon?: React.ElementType;
  iconBgClassName?: string;   // ✅ endi bor
  iconClassName?: string;     // ✅ endi bor

  size?: Size;
  showClose?: boolean;

  children: React.ReactNode;
  footer?: React.ReactNode;
};

function sizeClass(size: Size) {
  if (size === "sm") return "sm:max-w-[420px]";
  if (size === "lg") return "sm:max-w-[760px]";
  return "sm:max-w-[540px]";
}

export function PremiumFormModal({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconBgClassName = "bg-secondary",
  iconClassName = "text-secondary",
  size = "md",
  showClose = true,
  children,
  footer,
}: PremiumFormModalProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div
              className={cx(
                "relative w-full overflow-hidden rounded-2xl bg-primary",
                "shadow-2xl ring-1 ring-primary ring-inset",
                sizeClass(size),
              )}
            >
              {/* Close */}
              {showClose ? (
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className={cx(
                    "absolute right-3 top-3 size-11 rounded-lg p-2",
                    "text-fg-quaternary transition duration-100 ease-linear",
                    "hover:bg-primary_hover hover:text-fg-quaternary_hover",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus-ring",
                  )}
                >
                  <XClose className="size-5" />
                </button>
              ) : null}

              {/* Header */}
              <div className="flex items-start gap-3 px-4 pt-5 sm:px-6 sm:pt-6">
                {Icon ? (
                  <div
                    className={cx(
                      "relative grid size-11 place-items-center overflow-hidden rounded-xl",
                      "ring-1 ring-primary ring-inset shadow-xs",
                      iconBgClassName,
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    <Icon className={cx("relative size-5", iconClassName)} aria-hidden="true" />
                  </div>
                ) : null}

                <div className="flex min-w-0 flex-col gap-0.5 pr-10">
                  <h2 className="text-md font-semibold text-primary">{title}</h2>
                  {description ? <p className="text-sm text-tertiary">{description}</p> : null}
                </div>
              </div>

              <div className="mt-5 h-px w-full bg-primary/60" />

              {/* Body */}
              <div className="max-h-[78vh] overflow-y-auto px-4 py-5 sm:px-6">
                {children}
              </div>

              {/* Footer */}
              {footer ? (
                <>
                  <div className="h-px w-full bg-primary/60" />
                  <div className="px-4 py-5 sm:px-6">{footer}</div>
                </>
              ) : null}
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
