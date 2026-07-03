"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { Clock } from "@untitledui/icons";
import { useControlledState } from "@react-stately/utils";
import { Time } from "@internationalized/date";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

export interface TimeValue {
  hour: number;
  minute: number;
}

interface TimePickerProps {
  value?: Time | null;
  defaultValue?: Time | null;
  onChange?: (value: Time) => void;
  placeholder?: string;
  isRequired?: boolean;
  "aria-label"?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 40;

const pad = (n: number) => String(n).padStart(2, "0");

// ─── Scroll Column ──────────────────────────────────────────────────────────
function ScrollColumn({
  items,
  selected,
  onSelect,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const smoothScroll = (target: number) => {
    const el = listRef.current;
    if (!el) return;
    animate(el.scrollTop, target * ITEM_HEIGHT, {
      duration: 0.35,
      ease: [0.32, 0.72, 0, 1], // iOS spring-like
      onUpdate: (v) => {
        if (listRef.current) listRef.current.scrollTop = v;
      },
    });
  };

  // Initial scroll — instant snap, no animation
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = selected * ITEM_HEIGHT;
  }, []); // only on mount

  const handleClick = (v: number) => {
    if (v === selected) return;
    onSelect(v);
    smoothScroll(v);
  };

  return (
    // 3 items visible: ITEM_HEIGHT * 3 = 120px
    <div className="relative h-[120px] w-[60px] overflow-hidden">
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-primary to-transparent" />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-primary to-transparent" />

      <div
        ref={listRef}
        className="flex h-full flex-col overflow-y-auto outline-none scrollbar-hide"
        style={{ scrollSnapType: "y mandatory", paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT }}
        onScroll={(e) => {
          if (isScrolling.current) return;
          const idx = Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(idx, items.length - 1));
          if (items[clamped] !== selected) {
            onSelect(items[clamped]);
          }
        }}
      >
        {items.map((v) => (
          <button
            key={v}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleClick(v)}
            style={{ scrollSnapAlign: "center", height: ITEM_HEIGHT, minHeight: ITEM_HEIGHT }}
            className={cx(
              "flex w-full shrink-0 items-center justify-center",
              "outline-none focus:outline-none focus-visible:outline-none",
              "transition-all duration-150 select-none",
              v === selected
                ? "text-brand font-bold text-2xl"
                : "text-quaternary font-normal text-sm hover:text-secondary cursor-pointer"
            )}
          >
            {pad(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Time Picker ─────────────────────────────────────────────────────────────
export const TimePicker = ({
  value: valueProp,
  defaultValue,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: TimePickerProps) => {
  const [value, setValue] = useControlledState(
    valueProp,
    defaultValue ?? null,
    onChange
  );

  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [pendingHour, setPendingHour] = useState(value?.hour ?? 10);
  const [pendingMinute, setPendingMinute] = useState(value?.minute ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync pending state when popover opens + compute direction
  useEffect(() => {
    if (open) {
      // Default = current time (24h)
      const now = new Date();
      const h = value?.hour ?? now.getHours();
      const m = value?.minute ?? now.getMinutes();
      setPendingHour(h);
      setPendingMinute(m);
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setOpenUp(rect.bottom > window.innerHeight / 2);
        // Popover kengligini (220px) hisobga olib, o'ngda joy borligini tekshiramiz
        setOpenLeft(rect.left + 220 > window.innerWidth);
      }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayText = value
    ? `${pad(value.hour)}:${pad(value.minute)}`
    : (placeholder ?? "Soat tanlang");

  const handleApply = () => {
    setValue(new Time(pendingHour, pendingMinute));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full" aria-label={ariaLabel}>
      {/* Trigger — matches DatePicker style exactly */}
      <Button
        ref={triggerRef as any}
        type="button"
        size="md"
        color="secondary"
        iconLeading={Clock}
        className="w-full justify-start text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "text-primary" : "text-placeholder"}>
          {displayText}
        </span>
      </Button>

      {/* Popover — flips up/down based on screen position */}
      {open && (
        <div
          className={cx(
            "absolute z-50 w-[260px]",
            openLeft ? "right-0" : "left-0",
            openUp ? "bottom-full mb-2" : "top-full mt-2",
            "rounded-2xl bg-primary shadow-xl ring-1 ring-secondary_alt",
            "animate-in fade-in duration-150",
            openUp ? "slide-in-from-bottom-1" : "slide-in-from-top-1",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-secondary px-5 py-3">
            <span className="text-sm font-semibold text-primary">Soat tanlash</span>
            <div className="text-2xl font-bold text-brand tabular-nums tracking-tight">
              {pad(pendingHour)}:{pad(pendingMinute)}
            </div>
          </div>

          {/* Column selectors */}
          <div className="flex items-center justify-center gap-4 px-5 py-3">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-tertiary uppercase tracking-widest">Soat</span>
              <ScrollColumn
                items={HOURS}
                selected={pendingHour}
                onSelect={setPendingHour}
              />
            </div>

            {/* Colon separator aligned to center row */}
            <div className="flex items-center self-center pb-1">
              <span className="text-xl font-bold text-tertiary">:</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-tertiary uppercase tracking-widest">Daqiqa</span>
              <ScrollColumn
                items={MINUTES}
                selected={pendingMinute}
                onSelect={setPendingMinute}
              />
            </div>
          </div>

          {/* Actions — identical layout to DatePicker */}
          <div className="grid grid-cols-2 gap-3 border-t border-secondary p-4">
            <Button size="lg" color="secondary" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button size="lg" color="primary" onClick={handleApply}>
              Tasdiqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
