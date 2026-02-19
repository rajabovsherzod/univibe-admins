"use client";

import type { FC, HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";

import {
  ChevronSelectorVertical,
  LogOut01,
  Settings01,
  User01,
  Sun,
  Moon01,
  Monitor01,
  Check,
} from "@untitledui/icons";
import { useFocusManager } from "react-aria";
import type { DialogProps as AriaDialogProps } from "react-aria-components";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Avatar } from "@/components/base/avatar/avatar";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { cx } from "@/utils/cx";

type Placement =
  | "top" | "bottom" | "left" | "right"
  | "top right" | "top left" | "bottom right" | "bottom left"
  | "right top" | "right bottom" | "left top" | "left bottom";

// Theme options
const themes = [
  { id: "light", label: "Yorug'", icon: Sun },
  { id: "dark", label: "Qorong'u", icon: Moon01 },
  { id: "system", label: "Tizim", icon: Monitor01 },
] as const;

export const NavAccountMenu = ({
  className,
  onClose,
  ...dialogProps
}: AriaDialogProps & { className?: string; onClose?: () => void }) => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const focusManager = useFocusManager();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": focusManager?.focusNext({ tabbable: true, wrap: true }); break;
        case "ArrowUp": focusManager?.focusPrevious({ tabbable: true, wrap: true }); break;
        case "Escape": onClose?.(); break;
      }
    },
    [focusManager, onClose],
  );

  useEffect(() => {
    const element = dialogRef.current;
    if (element) element.addEventListener("keydown", onKeyDown);
    return () => { if (element) element.removeEventListener("keydown", onKeyDown); };
  }, [onKeyDown]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AriaDialog
      {...dialogProps}
      ref={dialogRef}
      className={cx("w-72 rounded-xl bg-secondary_alt shadow-lg ring ring-secondary_alt outline-hidden", className)}
    >
      <div className="rounded-xl bg-primary ring-1 ring-secondary">
        {/* User Info Header */}
        {session?.user && (
          <div className="border-b border-secondary px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={undefined}
                initials={session.user.full_name?.charAt(0).toUpperCase() || "U"}
                size="lg"
                status="online"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">
                  {session.user.full_name}
                </p>
                <p className="text-xs text-tertiary truncate">
                  {session.user.email}
                </p>
                <span className="inline-flex items-center mt-1 rounded-full bg-brand-primary_alt px-2 py-0.5 text-xs font-medium text-brand-secondary">
                  Admin
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex flex-col gap-0.5 py-1.5">
          <NavAccountCardMenuItem
            label="Profil"
            icon={User01}
            onClick={() => router.push("/settings/profile")}
          />
          <NavAccountCardMenuItem
            label="Sozlamalar"
            icon={Settings01}
            onClick={() => router.push("/settings")}
          />
        </div>

        {/* Theme Switcher */}
        <div className="border-t border-secondary py-1.5">
          <div className="px-3 pt-1.5 pb-1 text-xs font-semibold text-tertiary">Mavzu</div>
          <div className="flex gap-1 px-3 py-1">
            {mounted && themes.map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cx(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors",
                    isSelected
                      ? "bg-brand-primary_alt text-brand-secondary ring-1 ring-brand-solid"
                      : "text-tertiary hover:bg-primary_hover hover:text-secondary"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-1 pb-1.5">
        <NavAccountCardMenuItem
          label="Chiqish"
          icon={LogOut01}
          onClick={handleSignOut}
          className="text-error-primary hover:bg-error-primary"
        />
      </div>
    </AriaDialog>
  );
};

const NavAccountCardMenuItem = ({
  icon: Icon,
  label,
  shortcut,
  className: customClassName,
  ...buttonProps
}: {
  icon?: FC<{ className?: string }>;
  label: string;
  shortcut?: string;
  className?: string;
} & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...buttonProps}
      className={cx("group/item w-full cursor-pointer px-1.5 focus:outline-hidden", customClassName)}
    >
      <div
        className={cx(
          "flex w-full items-center justify-between gap-3 rounded-md p-2 group-hover/item:bg-primary_hover",
          "outline-focus-ring group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-2",
        )}
      >
        <div className="flex gap-2 text-sm font-semibold text-secondary group-hover/item:text-secondary_hover">
          {Icon && <Icon className="size-5 text-fg-quaternary" />} {label}
        </div>
        {shortcut && (
          <kbd className="flex rounded px-1 py-px font-body text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset">
            {shortcut}
          </kbd>
        )}
      </div>
    </button>
  );
};

export const NavAccountCard = ({
  popoverPlacement,
}: {
  popoverPlacement?: Placement;
} = {}) => {
  const { data: session, status } = useSession();
  const triggerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpoint("lg");
  const [isOpen, setIsOpen] = useState(false);

  const displayUser = session?.user;

  // Skeleton while loading
  if (!displayUser && status === "loading") {
    return (
      <div className="relative flex items-center gap-3 rounded-xl p-3 ring-1 ring-secondary ring-inset animate-pulse">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-secondary" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-24 rounded bg-secondary" />
            <div className="h-3 w-32 rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) return null;

  return (
    <div ref={triggerRef} className="relative flex items-center gap-3 rounded-xl p-3 ring-1 ring-secondary ring-inset">
      <AvatarLabelGroup
        size="md"
        src={undefined}
        title={displayUser.full_name || "Foydalanuvchi"}
        subtitle={displayUser.email || ""}
        status="online"
      />

      <div className="absolute top-1.5 right-1.5">
        <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
          <AriaButton className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 pressed:bg-primary_hover pressed:text-fg-quaternary_hover">
            <ChevronSelectorVertical className="size-4 shrink-0" />
          </AriaButton>
          <AriaPopover
            placement={popoverPlacement ?? (isDesktop ? "right bottom" : "top right")}
            triggerRef={triggerRef}
            offset={8}
            className={({ isEntering, isExiting }) =>
              cx(
                "origin-(--trigger-anchor-point) will-change-transform z-50",
                isEntering &&
                "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                isExiting &&
                "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
              )
            }
          >
            <NavAccountMenu onClose={() => setIsOpen(false)} />
          </AriaPopover>
        </AriaDialogTrigger>
      </div>
    </div>
  );
};
