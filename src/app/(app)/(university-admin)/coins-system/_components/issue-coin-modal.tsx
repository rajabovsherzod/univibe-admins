"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Coins01, SearchSm } from "@untitledui/icons";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Select } from "@/components/base/select/select";

import { useIssueCoins } from "@/hooks/api/use-transactions";
import { useStudents } from "@/hooks/api/use-students";
import { useCoinRules } from "@/hooks/api/use-coins";

const IssueCoinSchema = z.object({
  student_public_id: z.string().min(1, "Talabani tanlang"),
  coin_rule_public_id: z.string().min(1, "Qoidani tanlang"),
  comment: z.string().optional(),
});

type IssueCoinInputForm = z.infer<typeof IssueCoinSchema>;

interface IssueCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudent?: {
    id: string;
    name: string;
  };
}

export function IssueCoinModal({ isOpen, onClose, preselectedStudent }: IssueCoinModalProps) {
  const { mutateAsync: issueCoins, isPending } = useIssueCoins();

  // Real apps might use debounced async Selects for students because there might be thousands
  // We'll use a basic search + dropdown combo to simulate the UX here.
  const [studentSearch, setStudentSearch] = useState("");
  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    search: studentSearch,
    page_size: 10
  });

  const { data: rulesData, isLoading: rulesLoading } = useCoinRules({
    status: "active",
    page_size: 50
  });

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<IssueCoinInputForm>({
    resolver: zodResolver(IssueCoinSchema),
    defaultValues: {
      student_public_id: preselectedStudent?.id || "",
      coin_rule_public_id: "",
      comment: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setStudentSearch("");
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IssueCoinInputForm) => {
    try {
      await issueCoins(data);
      toast.success("Ball Muvaffaqiyatli Berildi", {
        description: "Talaba hisobiga joriy qoida asosida coin qo'shildi.",
      });
      onClose();
    } catch (error: any) {
      toast.error("Ball berishda xatolik", {
        description: error.message || "Tizimli xatolik.",
      });
    }
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Talabaga Ball Berish"
      description="Faoliyati uchun talabani tanlab unga coin taqdim eting."
      icon={Coins01}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button color="secondary" onClick={onClose} isDisabled={isPending}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="issue-coin-form"
            isDisabled={isPending}
            isLoading={isPending}
          >
            Berish
          </Button>
        </div>
      }
    >
      <form id="issue-coin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div className="space-y-1">
          {preselectedStudent ? (
            <Input
              label="Talaba"
              value={preselectedStudent.name}
              isDisabled
              isReadOnly
            />
          ) : (
            <>
              {/* Pseudo-autocomplete UX since UntitedUI Select with raw typing isn't native */}
              <Input
                placeholder="Talaba ismi bo'yicha qidirish..."
                value={studentSearch}
                onChange={(val) => setStudentSearch(val)}
                className="mb-2"
              />

              <Controller
                name="student_public_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    items={studentsData?.results?.map(s => ({ id: s.user_public_id, label: `${s.name} ${s.surname}` })) || []}
                    selectedKey={field.value || null}
                    onSelectionChange={(key) => field.onChange(String(key))}
                    placeholder={studentsLoading ? "Yuklanmoqda..." : "Talabani ro'yxatdan tanlang"}
                    isDisabled={isPending || studentsLoading}
                    isInvalid={!!fieldState.error}
                    hint={fieldState.error?.message}
                    className="w-full"
                  >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                  </Select>
                )}
              />
            </>
          )}
        </div>

        <Controller
          name="coin_rule_public_id"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              items={rulesData?.results?.map((r: any) => ({ id: r.public_id, label: `${r.name} (${r.coin_amount} Coin)` })) || []}
              selectedKey={field.value || null}
              onSelectionChange={(key) => field.onChange(String(key))}
              placeholder={rulesLoading ? "Yuklanmoqda..." : "Qoidani tanlang"}
              isDisabled={isPending || rulesLoading}
              isInvalid={!!fieldState.error}
              hint={fieldState.error?.message}
              label="Coin Qoidasi"
              className="w-full"
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
          )}
        />

        <Controller
          name="comment"
          control={control}
          render={({ field, fieldState }) => (
            <TextArea
              {...field}
              label="Izoh (Ixtiyoriy)"
              placeholder="Qo'shimcha ma'lumot qoldiring"
              isInvalid={!!fieldState.error}
              hint={fieldState.error?.message}
              isDisabled={isPending}
              rows={3}
            />
          )}
        />
      </form>
    </PremiumFormModal>
  );
}
