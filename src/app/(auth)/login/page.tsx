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

  return (
    <section className="relative flex min-h-screen bg-primary">
      {/* Left Side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-600 overflow-hidden items-center justify-center p-12">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-white opacity-5 blur-[100px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-brand-900 opacity-20 blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-400 opacity-20 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-white w-full max-w-lg text-center">
          {/* The SVG */}
          <div className="relative w-full max-w-[480px] aspect-square mb-8 transition-transform duration-700 hover:scale-105">
            <Image 
              src="/register/login.svg" 
              alt="Login Visual" 
              fill 
              className="object-contain drop-shadow-2xl" 
              priority
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <h2 className="text-display-md font-bold tracking-tight text-white leading-tight">
              Univibe Boshqaruv Paneli
            </h2>
            <p className="text-brand-100 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Universitetingizni zamonaviy va raqamli usulda boshqaring. Barcha jarayonlar endi bitta joyda.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-12 bg-primary">
        <div className="w-full max-w-[440px] flex flex-col gap-10">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center bg-brand-50 p-2.5 rounded-xl shadow-xs border border-brand-100">
                <Image
                  src="/icon.svg"
                  alt="Univibe Logo"
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-auto"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary">Univibe</span>
            </div>
            <h1 className="text-display-xs font-bold text-primary md:text-display-sm tracking-tight">
              Tizimga kirish
            </h1>
            <p className="text-tertiary text-md">
              Boshqaruv paneliga kirish uchun ma'lumotlaringizni kiriting.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Role Tabs */}
            <div className="p-1 bg-secondary rounded-xl ring-1 ring-inset ring-secondary shadow-sm">
              <Tabs
                selectedKey={selectedRole}
                onSelectionChange={handleRoleChange}
                className="w-full"
              >
                <Tabs.List fullWidth type="button-brand" items={ROLE_TABS} className="w-full">
                  {(item) => <Tabs.Item id={item.id} className="py-2.5 text-sm font-semibold">{item.label}</Tabs.Item>}
                </Tabs.List>
              </Tabs>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-5">
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      label="Email manzil"
                      type="email"
                      placeholder="admin@univibe.uz"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      isDisabled={loginMutation.isPending}
                      isInvalid={!!errors.email}
                      hint={errors.email?.message}
                      autoComplete="email"
                      className="transition-all duration-200"
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
                      className="transition-all duration-200"
                    />
                  )}
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                   {/* Placeholder for remember me checkbox if needed */}
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded px-1 -mx-1"
                  tabIndex={0}
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={loginMutation.isPending}
                isLoading={loginMutation.isPending}
                className="w-full mt-2 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loginMutation.isPending ? "Tizimga kirilmoqda..." : "Kirish"}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-start">
            <p className="text-sm text-tertiary">
              Hali hisobingiz yo&apos;qmi?{" "}
              <span className="text-brand-600 font-semibold hover:text-brand-700 cursor-pointer transition-colors">
                Administratorga murojaat qiling.
              </span>
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
