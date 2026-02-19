"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomToast } from "@/components/base/toast/custom-toast";
import type { LoginFormData } from "./login-schema";

export function useLoginMutation(selectedRole: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await signIn(selectedRole, {
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
    onSuccess: () => {
      toast.custom((t) => (
        <CustomToast
          t= { t }
          type = "success"
          title = "Muvaffaqiyatli kirildi"
          description = "Siz tizimga muvaffaqiyatli kirdingiz. Dashboardga yo'naltirilmoqdasiz."
        />
      ));
  router.push("/dashboard");
  router.refresh();
},
onError: (error) => {
  toast.custom((t) => (
    <CustomToast
          t= { t }
          type = "error"
          title = "Kirishda xatolik"
          description = { error.message || "Tizim xatosi yuz berdi." }
    />
      ));
},
  });
}
