"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor01, Moon01, Sun } from "@untitledui/icons";

type Mode = "system" | "light" | "dark";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Hydration paytida "theme" aniq bo‘lmasligi mumkin
  const active: Mode = (mounted ? (theme as Mode) : "system") ?? "system";

  const currentIcon = (() => {
    if (!mounted) return <Monitor01 className="size-4" />;
    if (active === "system") return <Monitor01 className="size-4" />;
    return resolvedTheme === "dark" ? <Moon01 className="size-4" /> : <Sun className="size-4" />;
  })();

  const Button = ({
    mode,
    label,
    icon,
  }: {
    mode: Mode;
    label: string;
    icon: React.ReactNode;
  }) => {
    const isActive = active === mode;

    return (
      <button
        type="button"
        onClick={() => setTheme(mode)}
        aria-pressed={isActive}
        className={cx(
          "inline-flex size-9 items-center justify-center rounded-lg transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          "ring-offset-bg-primary",
          isActive
            ? "bg-secondary text-primary shadow-xs ring-1 ring-primary ring-inset"
            : "text-tertiary hover:bg-primary_hover hover:text-secondary",
        )}
        title={label}
      >
        <span className="sr-only">{label}</span>
        {icon}
      </button>
    );
  };

  return (
    <div
      className={cx(
        "inline-flex items-center gap-1 rounded-xl bg-primary p-1",
        "shadow-xs-skeumorphic ring-1 ring-primary ring-inset",
        className,
      )}
    >
      {/* chap tomonda hozirgi holatni ko‘rsatadigan kichik indikator */}
      <div className="hidden items-center gap-2 pl-2 pr-1 text-sm text-tertiary md:flex">
        <span className="text-tertiary">{currentIcon}</span>
        <span className="font-medium">
          {active === "system" ? "System" : active === "dark" ? "Dark" : "Light"}
        </span>
      </div>

      <Button mode="system" label="System" icon={<Monitor01 className="size-4" />} />
      <Button mode="light" label="Light" icon={<Sun className="size-4" />} />
      <Button mode="dark" label="Dark" icon={<Moon01 className="size-4" />} />
    </div>
  );
}
