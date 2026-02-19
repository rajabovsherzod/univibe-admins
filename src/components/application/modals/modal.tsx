"use client";

import * as React from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";

import { cx } from "@/utils/cx";

// ✅ versiyaga bog‘liq type’larni olib tashlaymiz
type DialogProps = React.ComponentPropsWithoutRef<typeof AriaDialog>;
type ModalOverlayProps = React.ComponentPropsWithoutRef<typeof AriaModalOverlay>;
type ModalProps = React.ComponentPropsWithoutRef<typeof AriaModal>;

export const DialogTrigger = AriaDialogTrigger;

export const ModalOverlay = ({
  className,
  shouldCloseOnInteractOutside,
  ...props
}: ModalOverlayProps) => {
  return (
    <AriaModalOverlay
      {...props}
      // ✅ trigger click "outside" deb yopilib ketmasin
      shouldCloseOnInteractOutside={
        shouldCloseOnInteractOutside ??
        ((el) => !el?.closest?.("[data-modal-trigger]"))
      }
      className={(state: any) =>
        cx(
          "fixed inset-0 z-50 flex min-h-dvh w-full items-end justify-center overflow-y-auto",
          "bg-overlay/70 px-4 pt-4 pb-[clamp(16px,8vh,64px)] outline-hidden backdrop-blur-[6px]",
          "sm:items-center sm:justify-center sm:p-8",
          state?.isEntering && "duration-300 ease-out animate-in fade-in",
          state?.isExiting && "duration-200 ease-in animate-out fade-out",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
};

export const Modal = ({ className, ...props }: ModalProps) => (
  <AriaModal
    {...props}
    className={(state: any) =>
      cx(
        "max-h-full w-full align-middle outline-hidden",
        "max-sm:overflow-y-auto max-sm:rounded-xl",
        state?.isEntering && "duration-300 ease-out animate-in zoom-in-95",
        state?.isExiting && "duration-200 ease-in animate-out zoom-out-95",
        typeof className === "function" ? className(state) : className,
      )
    }
  />
);

export const Dialog = ({ className, ...props }: DialogProps) => (
  <AriaDialog
    {...props}
    className={cx("flex w-full items-center justify-center outline-hidden", className)}
  />
);
