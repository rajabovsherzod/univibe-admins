"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

import { loginSchema, type LoginFormData } from "./login-schema";
import { useLoginMutation } from "./use-login-mutation";

type Role = "university-admin" | "university-staff";

const ROLE_TABS = [
  { id: "university-admin", label: "Universitet Admini" },
  { id: "university-staff", label: "Universitet Xodimi" },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Key>("university-admin");

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleChange = (key: Key) => {
    setSelectedRole(key);
    reset();
  };

  const loginMutation = useLoginMutation(selectedRole as string);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const HEADER_OFFSET = 80;

  return (
    <section
      className="relative flex flex-col items-center justify-center bg-primary px-4"
      style={{ minHeight: `calc(100svh - ${HEADER_OFFSET}px)` }}
    >

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-10 pb-8 md:pt-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center">
            <Image
              src="/icon.svg"
              alt="Univibe Logo"
              width={80}
              height={80}
              unoptimized
              className="h-20 w-auto"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
              Tizimga kirish
            </h1>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card-primary p-6 shadow-xs-skeumorphic ring-1 ring-primary ring-inset md:p-7">

          {/* Role Tabs */}
          <div className="mb-6">
            <Tabs
              selectedKey={selectedRole}
              onSelectionChange={handleRoleChange}
              className="w-full"
            >
              <Tabs.List fullWidth type="button-brand" items={ROLE_TABS}>
                {(item) => <Tabs.Item id={item.id}>{item.label}</Tabs.Item>}
              </Tabs.List>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@univibe.uz"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isDisabled={loginMutation.isPending}
                    isInvalid={!!errors.email}
                    hint={errors.email?.message}
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    label="Parol"
                    type="password"
                    placeholder="••••••••"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isDisabled={loginMutation.isPending}
                    isInvalid={!!errors.password}
                    hint={errors.password?.message}
                    autoComplete="current-password"
                  />
                )}
              />
            </div>

            {/* Forgot Password Link only */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-solid rounded"
                tabIndex={0}
              >
                Parolni unutdingizmi?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              isDisabled={loginMutation.isPending}
              isLoading={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "Kirish..." : "Kirish"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-tertiary">
          Hali hisobingiz yo&apos;qmi? <span className="text-brand-solid font-medium">Administratorga murojaat qiling.</span>
        </p>

      </div>
    </section>
  );
}
