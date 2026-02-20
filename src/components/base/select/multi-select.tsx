"use client";

import type { FC, ReactNode, Ref, RefAttributes } from "react";
import { createContext, isValidElement, useState, useRef } from "react";
import { ChevronDown } from "@untitledui/icons";
import type { ListBoxProps as AriaListBoxProps } from "react-aria-components";
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  SelectValue as AriaSelectValue,
  Group as AriaGroup,
  Dialog as AriaDialog
} from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { cx } from "@/utils/cx";
import { Popover } from "./popover";
import { SelectItem } from "./select-item";
import type { SelectItemType, CommonProps } from "./select";
import type { Selection, Key } from "react-aria-components";

interface MultiSelectProps extends Omit<AriaListBoxProps<SelectItemType>, "children" | "items" | "selectionMode">, RefAttributes<HTMLDivElement>, CommonProps {
  items?: SelectItemType[];
  popoverClassName?: string;
  placeholderIcon?: FC | ReactNode;
  children: ReactNode | ((item: SelectItemType) => ReactNode);
  selectedKeys?: "all" | Iterable<Key>;
  onSelectionChange?: (keys: Selection) => void;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

export const sizes = {
  sm: { root: "py-2 px-3", shortcut: "pr-2.5" },
  md: { root: "py-2.5 px-3.5", shortcut: "pr-3" },
};

export const MultiSelectContext = createContext<{ size: "sm" | "md" }>({ size: "sm" });

const MultiSelect = ({
  placeholder = "Select items",
  placeholderIcon,
  size = "sm",
  children,
  items,
  label,
  hint,
  tooltip,
  selectedKeys,
  onSelectionChange,
  isInvalid,
  isRequired,
  isDisabled,
  className,
  ...rest
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const Icon = placeholderIcon;
  const selectedCount = selectedKeys === "all" ? (items?.length || 0) : selectedKeys ? Array.from(selectedKeys as Iterable<Key>).length : 0;

  // Find first selected item label (if any)
  let summaryText = placeholder;
  if (selectedCount > 0 && items) {
    summaryText = `${selectedCount} tanlandi`;
  }

  return (
    <MultiSelectContext.Provider value={{ size }}>
      <div className={cx("flex flex-col gap-1.5", typeof className === "function" ? className(undefined as any) : className)}>
        {label && (
          <Label isRequired={isRequired} tooltip={tooltip}>
            {label}
          </Label>
        )}

        <AriaButton
          ref={triggerRef}
          onPress={() => setIsOpen(!isOpen)}
          className={cx(
            "relative flex w-full cursor-pointer items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset",
            isOpen && "ring-2 ring-brand",
            isDisabled && "cursor-not-allowed bg-disabled_subtle opacity-70",
            sizes[size].root,
          )}
          isDisabled={isDisabled}
        >
          <div className="flex h-max w-full items-center justify-start gap-2 truncate text-left align-middle *:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-fg-quaternary">
            {isValidElement(Icon) ? Icon : null}

            <p className={cx("text-md truncate", selectedCount > 0 ? "font-medium text-primary" : "text-placeholder")}>
              {summaryText}
            </p>

            <ChevronDown
              aria-hidden="true"
              className={cx("ml-auto shrink-0 text-fg-quaternary", size === "sm" ? "size-4 stroke-[2.5px]" : "size-5")}
            />
          </div>
        </AriaButton>

        {isOpen && (
          <Popover isOpen={isOpen} onOpenChange={setIsOpen} size={size} triggerRef={triggerRef} className={rest.popoverClassName}>
            <AriaDialog aria-label={label || "Multi select dialog"} className="outline-hidden">
              <AriaListBox
                items={items}
                className="size-full outline-hidden max-h-[300px] overflow-y-auto"
                selectionMode="multiple"
                selectedKeys={selectedKeys as Iterable<Key>}
                onSelectionChange={onSelectionChange}
                {...rest}
              >
                {children}
              </AriaListBox>
            </AriaDialog>
          </Popover>
        )}

        {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
      </div>
    </MultiSelectContext.Provider>
  );
};

const _MultiSelect = MultiSelect as typeof MultiSelect & {
  Item: typeof SelectItem;
};
_MultiSelect.Item = SelectItem;

export { _MultiSelect as MultiSelect };
