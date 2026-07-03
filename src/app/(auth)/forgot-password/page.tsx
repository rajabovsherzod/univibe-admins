"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage("Bu funksiya yaqinda qo'shiladi!");
    }, 1000);
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
              src="/register/forgot-password.svg" 
              alt="Forgot Password Visual" 
              fill 
              className="object-contain drop-shadow-2xl" 
              priority
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <h2 className="text-display-md font-bold tracking-tight text-white leading-tight">
              Parolni tiklash
            </h2>
            <p className="text-brand-100 text-lg font-medium max-w-md mx-auto leading-relaxed">
              Xavotir olmang, hisobingizga kirishni qayta tiklash juda oson. Biz sizga yordam beramiz!
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
            
            <Link 
              href="/login" 
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 w-fit mb-2"
            >
              &larr; Tizimga qaytish
            </Link>
            
            <h1 className="text-display-xs font-bold text-primary md:text-display-sm tracking-tight">
              Parolni unutdingizmi?
            </h1>
            <p className="text-tertiary text-md">
              Elektron pochta manzilingizni kiriting va biz parolni tiklash bo'yicha ko'rsatmalarni yuboramiz.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-5">
                <Input
                  label="Email manzil"
                  type="email"
                  placeholder="admin@univibe.uz"
                  value={email}
                  onChange={(v) => setEmail(v as string)}
                  isDisabled={isSubmitting}
                  isRequired
                  autoComplete="email"
                  className="transition-all duration-200"
                />
              </div>

              {message && (
                <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-brand-700 text-sm font-medium text-center transition-all animate-in fade-in slide-in-from-top-1">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={isSubmitting || !email}
                isLoading={isSubmitting}
                className="w-full mt-2 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? "Yuborilmoqda..." : "Tiklash havolasini yuborish"}
              </Button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
}
