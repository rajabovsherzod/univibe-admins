"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { ThemeSwitcher } from "@/components/application/theme/theme-switcher";
import { Tabs } from "@/components/application/tabs/tabs";
import { CustomToast } from "@/components/base/toast/custom-toast";

// Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, "Email kiritish shart").email("Email noto'g'ri formatda"),
  password: z.string().min(1, "Parol kiritish shart").min(5, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type Role = "university-admin" | "university-staff";

const ROLE_TABS = [
  { id: "university-admin", label: "Universitet Admini" },
  { id: "university-staff", label: "Universitet Xodimi" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Key>("university-admin");

  const {
    register,
    handleSubmit,
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
    reset(); // Optional: reset form when switching roles
  };

  // TanStack Query Mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await signIn(selectedRole as string, {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Login yoki parol noto'g'ri. Iltimos qaytadan urinib ko'ring.");
      }

      if (!result?.ok) {
        throw new Error("Kutilmagan xatolik yuz berdi.");
      }

      return result;
    },
    // No onMutate (no loading toast)
    onSuccess: () => {
      // Custom Success Toast
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="success"
          title="Muvaffaqiyatli kirildi"
          description="Siz tizimga muvaffaqiyatli kirdingiz. Dashboardga yo'naltirilmoqdasiz."
        />
      ));
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error) => {
      // Custom Error Toast
      toast.custom((t) => (
        <CustomToast
          t={t}
          type="error"
          title="Kirishda xatolik"
          description={error.message || "Tizim xatosi yuz berdi."}
        />
      ));
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const HEADER_OFFSET = 80;

  return (
    <section
      className="relative flex flex-col items-center justify-center bg-primary px-4"
      style={{ minHeight: `calc(100svh - ${HEADER_OFFSET}px)` }}
    >
      <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
        <ThemeSwitcher />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-10 pb-8 md:pt-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center">
            {/* Light Mode Logo */}
            <Image
              src="/brand-light-logo.svg"
              alt="Univibe Logo"
              width={80}
              height={80}
              preload={true}
              unoptimized
              className="h-20 w-auto dark:hidden"
            />
            {/* Dark Mode Logo */}
            <Image
              src="/brand-dark-logo.png"
              alt="Univibe Logo"
              width={80}
              height={80}
              preload={true}
              unoptimized
              className="h-20 w-auto hidden dark:block"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
              Tizimga kirish
            </h1>
            {/* <p className="text-md text-tertiary">
              Davom etish uchun o'z vazifangizni tanlang va ma'lumotlarni kiriting.
            </p> */}
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
              {/* Email Field */}
              <div className="group flex w-full flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-secondary">Email</label>
                <div className={`relative flex w-full items-center rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow focus-within:ring-2 ${errors.email ? 'ring-error-solid focus-within:ring-error-solid' : 'ring-primary focus-within:ring-brand-solid'}`}>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                    placeholder="admin@univibe.uz"
                    className="m-0 w-full bg-transparent px-3.5 py-2.5 text-md text-primary outline-none placeholder:text-placeholder disabled:opacity-50"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-error-primary mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="group flex w-full flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-secondary">Parol</label>
                <div className={`relative flex w-full items-center rounded-lg bg-primary shadow-xs ring-1 ring-inset transition-shadow focus-within:ring-2 ${errors.password ? 'ring-error-solid focus-within:ring-error-solid' : 'ring-primary focus-within:ring-brand-solid'}`}>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    autoComplete="current-password"
                    disabled={loginMutation.isPending}
                    placeholder="••••••••"
                    className="m-0 w-full bg-transparent px-3.5 py-2.5 text-md text-primary outline-none placeholder:text-placeholder disabled:opacity-50"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-error-primary mt-1">{errors.password.message}</p>
                )}
              </div>
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
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative inline-flex h-max items-center justify-center gap-1.5 rounded-lg bg-brand-solid px-4 py-2.5 text-md font-semibold text-white shadow-xs-skeumorphic ring-1 ring-transparent ring-inset transition hover:bg-brand-solid_hover disabled:opacity-70 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-solid"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kirish...
                </span>
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-tertiary">
          Hali hisobingiz yo'qmi? <span className="text-brand-solid font-medium">Administratorga murojaat qiling.</span>
        </p>

      </div>
    </section>
  );
}
