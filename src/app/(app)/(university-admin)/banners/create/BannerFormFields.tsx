"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Toggle } from "@/components/base/toggle/toggle";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { parseDate } from "@internationalized/date";

interface BannerFormFieldsProps {
  control: any;
  errors: any;
}

/**
 * BannerFormFields - Banner ma'lumotlari uchun form fieldslar
 * Create va Edit sahifalarida qayta ishlatiladigan SRP komponent.
 */
export function BannerFormFields({ control, errors }: BannerFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-fg-primary">
                Nomi <span className="text-red-500">*</span>
              </label>
              <Input
                {...field}
                placeholder="Banner nomini kiriting"
                isInvalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-error-600">{errors.title.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="subtitle"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-fg-primary">
                Qo&apos;shimcha matn
              </label>
              <Input
                {...field}
                placeholder="Masalan: Yangi o'quv yili uchun qabul boshlandi"
                isInvalid={!!errors.subtitle}
              />
              {errors.subtitle && (
                <p className="text-xs text-error-600">{errors.subtitle.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* CTA Text & CTA Link */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="cta_text"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-fg-primary">
                CTA tugma matni
              </label>
              <Input
                {...field}
                placeholder="Masalan: Ro'yxatdan o'tish"
                isInvalid={!!errors.cta_text}
              />
              {errors.cta_text && (
                <p className="text-xs text-error-600">{errors.cta_text.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="cta_link"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-fg-primary">
                CTA havolasi
              </label>
              <Input
                {...field}
                placeholder="Masalan: https://univibe.uz/qabul"
                isInvalid={!!errors.cta_link}
              />
              {errors.cta_link && (
                <p className="text-xs text-error-600">{errors.cta_link.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Display Order & Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="display_order"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-fg-primary">
                Tartib raqami
              </label>
              <Input
                type="number"
                value={field.value?.toString() || ""}
                onChange={(value) => {
                  const num = parseInt(value);
                  field.onChange(isNaN(num) ? 0 : num);
                }}
                placeholder="0"
                hint="Kichik son birinchi bo'ladi"
                isInvalid={!!errors.display_order}
              />
              {errors.display_order && (
                <p className="text-xs text-error-600">
                  {errors.display_order.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-fg-primary">
            Holat
          </label>
          <Controller
            control={control}
            name="status"
            defaultValue="PUBLISHED"
            render={({ field }) => (
              <Select
                items={[
                  { id: "DRAFT", label: "Qoralama" },
                  { id: "PUBLISHED", label: "E'lon qilingan" },
                  { id: "ARCHIVED", label: "Arxivlangan" },
                ]}
                selectedKey={field.value}
                onSelectionChange={(key) => field.onChange(key)}
                isInvalid={!!errors.status}
              >
                {(item) => (
                  <Select.Item id={item.id}>{item.label}</Select.Item>
                )}
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-error-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Is Active */}
      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border-secondary">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-fg-primary">Banner ko&apos;rinishi</p>
          <p className="text-xs text-fg-tertiary">
            Banner dashboard&apos;da ko&apos;rinishi uchun ushbu sozlamani yoqing
          </p>
        </div>
        <Controller
          control={control}
          name="is_active"
          defaultValue={true}
          render={({ field }) => (
            <Toggle
              isSelected={field.value}
              onChange={(value) => field.onChange(value)}
              aria-label="Banner faol holati"
            />
          )}
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-fg-primary">
            Boshlanish sanasi
          </label>
          <Controller
            control={control}
            name="start_at"
            render={({ field }) => (
              <DatePicker
                placeholder="Boshlanish sanasini tanlang"
                value={field.value ? parseDate(field.value.split("T")[0]) : null}
                onChange={(date) => {
                  if (date) {
                    const dateStr = date.toString();
                    field.onChange(dateStr);
                  } else {
                    field.onChange("");
                  }
                }}
                isInvalid={!!errors.start_at}
              />
            )}
          />
          {errors.start_at && (
            <p className="text-xs text-error-600">
              {errors.start_at.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-fg-primary">
            Tugash sanasi
          </label>
          <Controller
            control={control}
            name="end_at"
            render={({ field }) => (
              <DatePicker
                placeholder="Tugash sanasini tanlang"
                value={field.value ? parseDate(field.value.split("T")[0]) : null}
                onChange={(date) => {
                  if (date) {
                    const dateStr = date.toString();
                    field.onChange(dateStr);
                  } else {
                    field.onChange("");
                  }
                }}
                isInvalid={!!errors.end_at}
              />
            )}
          />
          {errors.end_at && (
            <p className="text-xs text-error-600">
              {errors.end_at.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
