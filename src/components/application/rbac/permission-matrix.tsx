"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import type { RbacCatalog, RbacPermissionGroup } from "@/lib/api/types";

interface PermissionMatrixProps {
  catalog: RbacCatalog;
  /** Selected permission codes. */
  value: string[];
  onChange: (codes: string[]) => void;
  isDisabled?: boolean;
}

function groupCodes(group: RbacPermissionGroup): string[] {
  return group.permissions.map((p) => p.code);
}

export function PermissionMatrix({ catalog, value, onChange, isDisabled }: PermissionMatrixProps) {
  const selected = useMemo(() => new Set(value), [value]);

  const emit = (next: Set<string>) => onChange(Array.from(next));

  const toggleCode = (code: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(code);
    else next.delete(code);
    emit(next);
  };

  const toggleGroup = (group: RbacPermissionGroup, on: boolean) => {
    const next = new Set(selected);
    groupCodes(group).forEach((c) => (on ? next.add(c) : next.delete(c)));
    emit(next);
  };

  const selectAll = (on: boolean) => {
    const next = new Set(selected);
    for (const group of catalog.groups) {
      groupCodes(group).forEach((c) => (on ? next.add(c) : next.delete(c)));
    }
    emit(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Global controls */}
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" color="secondary" onClick={() => selectAll(true)} isDisabled={isDisabled}>
          Hammasini yoqish
        </Button>
        <Button size="sm" color="secondary" onClick={() => selectAll(false)} isDisabled={isDisabled}>
          Hammasini o'chirish
        </Button>
      </div>

      {catalog.groups.map((group) => {
        const codes = groupCodes(group);
        const selectedCount = codes.filter((c) => selected.has(c)).length;
        const allOn = selectedCount === codes.length && codes.length > 0;
        const someOn = selectedCount > 0 && !allOn;

        return (
          <div key={group.key} className="rounded-xl border border-secondary bg-primary">
            {/* Group header with master toggle */}
            <div className="flex items-center justify-between border-b border-secondary px-4 py-3">
              <Checkbox
                size="md"
                isSelected={allOn}
                isIndeterminate={someOn}
                isDisabled={isDisabled}
                onChange={() => toggleGroup(group, !allOn)}
                label={<span className="font-semibold text-primary">{group.label}</span>}
              />
              <span className="text-xs text-tertiary">
                {selectedCount}/{codes.length}
              </span>
            </div>

            {/* Individual permissions */}
            <div className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2">
              {group.permissions.map((perm) => (
                <Checkbox
                  key={perm.code}
                  isSelected={selected.has(perm.code)}
                  isDisabled={isDisabled}
                  onChange={(on) => toggleCode(perm.code, on)}
                  label={perm.label}
                  hint={perm.default_on ? "Standart yoqiq" : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
