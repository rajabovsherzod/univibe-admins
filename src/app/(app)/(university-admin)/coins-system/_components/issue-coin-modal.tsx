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
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

import { useIssueCoins } from "@/hooks/api/use-transactions";
import { useStudents } from "@/hooks/api/use-students";
import { useCoinRules } from "@/hooks/api/use-coins";
import { useDebounce } from "@/hooks/use-debounce";

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
    balance?: number;
  };
  ruleType?: "reward" | "penalty";
}

export function IssueCoinModal({ isOpen, onClose, preselectedStudent, ruleType = "reward" }: IssueCoinModalProps) {
  const { mutateAsync: issueCoins, isPending } = useIssueCoins();

  // Real apps might use debounced async Selects for students because there might be thousands
  // We'll use a basic search + dropdown combo to simulate the UX here.
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedStudentSearch = useDebounce(studentSearch, 500);

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    search: debouncedStudentSearch,
    page_size: 10,
    status: "approved"
  });

  const { data: rulesData, isLoading: rulesLoading } = useCoinRules({
    status: "active",
    page_size: 50,
    rule_type: ruleType
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
  }, [isOpen, reset, ruleType]);

  const onSubmit = async (data: IssueCoinInputForm) => {
    try {
      await issueCoins(data);
      toast.success(ruleType === "penalty" ? "Jarima muvaffaqiyatli belgilandi" : "Ball Muvaffaqiyatli Berildi", {
        description: `Talaba hisobiga joriy qoida asosida ball ${ruleType === "penalty" ? "ayirildi" : "qo'shildi"}.`,
      });
      onClose();
    } catch (error: any) {
      toast.error("Amaliyotda xatolik", {
        description: error.message || "Tizimli xatolik.",
      });
    }
  };

  const isPenalty = ruleType === "penalty";

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isPenalty ? "Talabaga Jarima Belgilash" : "Talabaga Ball Berish"}
      description={isPenalty ? "Qoidabuzarlik uchun talabaga jazo (manfiy ball) belgilang." : "Faoliyati uchun talabani tanlab unga ball taqdim eting."}
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
            color={isPenalty ? "primary-destructive" : "primary"}
            isDisabled={isPending}
            isLoading={isPending}
          >
            {isPenalty ? "Jarima belgilash" : "Berish"}
          </Button>
        </div>
      }
    >
      <form id="issue-coin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div className="space-y-1">
          {preselectedStudent ? (
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">Talaba</span>
                {preselectedStudent.balance !== undefined && (
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold bg-secondary px-2.5 py-1 rounded-full">
                    <span className="text-tertiary">Joriy balans:</span>
                    <span className={preselectedStudent.balance < 0 ? "text-error-500" : "text-brand-solid"}>
                      {preselectedStudent.balance > 0 ? `+${preselectedStudent.balance}` : preselectedStudent.balance}
                    </span>
                    <CoinOutlineIcon className={preselectedStudent.balance < 0 ? "text-error-500" : "text-brand-solid"} size={16} strokeWidth={24} />
                  </div>
                )}
              </div>
              <Input
                value={preselectedStudent.name}
                isDisabled
                isReadOnly
              />
            </div>
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
              items={rulesData?.results?.map((r: any) => ({ id: r.public_id, label: `${r.name} (${r.coin_amount > 0 ? '+' : ''}${r.coin_amount} Ball)` })) || []}
              selectedKey={field.value || null}
              onSelectionChange={(key) => field.onChange(String(key))}
              placeholder={rulesLoading ? "Yuklanmoqda..." : "Qoidani tanlang"}
              isDisabled={isPending || rulesLoading}
              isInvalid={!!fieldState.error}
              hint={fieldState.error?.message}
              label="Ball Qoidasi"
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
