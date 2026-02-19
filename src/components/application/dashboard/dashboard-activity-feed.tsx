"use client";

import React from "react";
import Link from "next/link";
import type { ElementType } from "react";
import { DotsVertical, Folder, Rows01, PieChart03, Settings01 } from "@untitledui/icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ActivityTone = "info" | "success" | "warning";

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  timeLabel: string;
  href?: string;
  tone?: ActivityTone;
  icon?: ElementType;
};

type Props = {
  items: ActivityItem[];
  showMenu?: boolean;
  onItemMenuClick?: (item: ActivityItem) => void;
  emptyText?: string;
};

function IconBox({ Icon, tone = "info" }: { Icon: ElementType; tone?: ActivityTone }) {
  return (
    <span
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-secondary_subtle",
        "shadow-xs ring-1 ring-secondary ring-inset"
      )}
    >
      <Icon
        className={cx(
          "size-5",
          tone === "success" && "text-fg-success-secondary",
          tone === "warning" && "text-fg-warning-secondary",
          tone === "info" && "text-fg-brand-secondary"
        )}
      />
    </span>
  );
}

function pickIcon(it: ActivityItem) {
  if (it.tone === "success") return PieChart03;
  if (it.tone === "warning") return Settings01;
  return Folder;
}

function Row({
  item,
  showMenu,
  onItemMenuClick,
}: {
  item: ActivityItem;
  showMenu: boolean;
  onItemMenuClick?: (item: ActivityItem) => void;
}) {
  const tone = item.tone ?? "info";
  const Icon = item.icon ?? pickIcon(item);

  const content = (
    <div
      className={cx(
        // ✅ row bg qaytdi (sen aytgandek)
        "group flex items-start gap-3 rounded-xl bg-primary px-3.5 py-3",
        "shadow-xs ring-1 ring-secondary ring-inset transition",
        "hover:bg-primary_hover"
      )}
    >
      {/* ✅ Chap blok: icon + text vertikal markazda */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconBox Icon={Icon} tone={tone} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-secondary">{item.title}</p>
          {item.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-tertiary">{item.description}</p>
          ) : null}
        </div>
      </div>

      {/* ✅ O‘ng blok: timeLabel tepada tursin, menu yonida/ostida bo‘lsin */}
      <div className="shrink-0 self-start text-right">
        <div className="flex items-start justify-end gap-2">
          <p className="text-xs font-medium text-tertiary">{item.timeLabel}</p>
        </div>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link key={item.id} href={item.href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <div key={item.id} className="block">
      {content}
    </div>
  );
}

export function DashboardActivityFeed({
  items,
  showMenu = true,
  onItemMenuClick,
  emptyText = "Hozircha faoliyat yo‘q.",
}: Props) {
  if (!items?.length) {
    return (
      <div className={cx("rounded-xl bg-primary px-4 py-8 text-center", "ring-1 ring-secondary ring-inset")}>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary_subtle ring-1 ring-secondary ring-inset">
          <Rows01 className="size-6 text-tertiary" />
        </div>
        <p className="mt-3 text-sm font-semibold text-secondary">{emptyText}</p>
        <p className="mt-1 text-sm text-tertiary">
          Adminlar action qilsa yoki studentlar ro‘yxatdan o‘tsa bu yerda chiqadi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <Row key={it.id} item={it} showMenu={showMenu} onItemMenuClick={onItemMenuClick} />
      ))}
    </div>
  );
}
