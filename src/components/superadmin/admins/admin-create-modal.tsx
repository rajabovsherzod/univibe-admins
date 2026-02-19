"use client";

import * as React from "react";
import { PremiumFormModal } from "@/components/application/modals/premium-form-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { UserPlus02 } from "@untitledui/icons";

type CreateAdminPayload = { name: string; email: string; password: string };
type FieldErrors = Partial<Record<keyof CreateAdminPayload, string>>;

function validate(p: CreateAdminPayload): FieldErrors {
  const e: FieldErrors = {};
  if (!p.name.trim()) e.name = "Ism kiritilishi shart.";
  if (!p.email.trim()) e.email = "Email kiritilishi shart.";
  if (p.password.length < 8) e.password = "Parol kamida 8 ta belgidan iborat bo‘lsin.";
  return e;
}

function getValue(arg: any) {
  if (typeof arg === "string") return arg;
  if (typeof arg?.value === "string") return arg.value;
  if (typeof arg?.target?.value === "string") return arg.target.value;
  return "";
}

export function AdminCreateModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (payload: CreateAdminPayload) => void | Promise<void>;
}) {
  const [form, setForm] = React.useState<CreateAdminPayload>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const nameError = submitted ? fieldErrors.name : undefined;
  const emailError = submitted ? fieldErrors.email : undefined;
  const passError = submitted ? fieldErrors.password : undefined;

  async function handleSubmit() {
    setSubmitted(true);
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);
      await onCreate?.(form);
      onOpenChange(false);
      setForm({ name: "", email: "", password: "" });
      setSubmitted(false);
      setFieldErrors({});
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumFormModal
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) {
          setSubmitted(false);
          setFieldErrors({});
        }
        onOpenChange(v);
      }}
      title="Yangi admin qo‘shish"
      description="Admin ma’lumotlarini kiriting."
      icon={UserPlus02}
      iconBgClassName="bg-brand-secondary"
      iconClassName="text-brand-secondary"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" color="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? "Yaratilmoqda..." : "Admin yaratish"}
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input
          size="md"
          label="Name"
          placeholder="Enter name"
          value={form.name}
          onChange={(arg: any) => setForm((p) => ({ ...p, name: getValue(arg) }))}
          isRequired
          isInvalid={Boolean(nameError)}
          hint={nameError}
          isDisabled={loading}
          autoFocus
          autoComplete="name"
        />

        <Input
          size="md"
          label="Email"
          placeholder="Enter email"
          value={form.email}
          onChange={(arg: any) => setForm((p) => ({ ...p, email: getValue(arg) }))}
          isRequired
          isInvalid={Boolean(emailError)}
          hint={emailError}
          isDisabled={loading}
          autoComplete="email"
        />

        <Input
          size="md"
          label="Password"
          placeholder="Create a password"
          value={form.password}
          onChange={(arg: any) => setForm((p) => ({ ...p, password: getValue(arg) }))}
          isRequired
          isInvalid={Boolean(passError)}
          hint={passError ?? "Must be at least 8 characters."}
          isDisabled={loading}
          autoComplete="new-password"
          type="password"
        />
      </form>
    </PremiumFormModal>
  );
}
