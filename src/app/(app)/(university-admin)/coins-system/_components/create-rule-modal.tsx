import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Minus } from "@untitledui/icons";

import { useCreateCoinRule } from "@/hooks/api/use-coins";
import { createCoinRuleSchema } from "@/lib/validations/coins";
import type { CreateCoinRuleInput } from "@/lib/validations/coins";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/base/buttons/button";
import { CoinOutlineIcon } from "@/components/custom-icons/brand-icon";

export function CreateRuleModal({ onClose, ruleType = "reward" }: { onClose: () => void, ruleType?: "reward" | "penalty" }) {
  const createMutation = useCreateCoinRule();

  const isPenalty = ruleType === "penalty";

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCoinRuleInput>({
    resolver: zodResolver(createCoinRuleSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      coin_amount: 0,
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: CreateCoinRuleInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(isPenalty ? "Jarima qoidasi muvaffaqiyatli yaratildi" : "Rag'batlantirish qoidasi muvaffaqiyatli yaratildi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik yuz berdi", { description: e.message });
    }
  };

  const isFormLoading = isSubmitting || createMutation.isPending;

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isPenalty ? "Yangi jarima qoidasi" : "Yangi rag'batlantirish qoidasi"}
      description={isPenalty ? "Talabalarga qanday qoidabuzarlik uchun jarima (minus ball) yozilishini belgilang." : "Talabalarga qaysi holatda ball (rag'bat) berish bo'yicha qoida yarating."}
      icon={Plus}
      iconBgClassName={isPenalty ? "bg-error-soft" : "bg-brand-soft"}
      iconClassName={isPenalty ? "text-error-solid" : "text-brand-solid"}
      size="md"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            color="secondary"
            size="md"
            onClick={onClose}
            isDisabled={isFormLoading}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="create-rule-form"
            color={isPenalty ? "primary-destructive" : "primary"}
            size="md"
            isLoading={isFormLoading}
          >
            {isFormLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      }
    >
      <form id="create-rule-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Qoida nomi"
              placeholder={isPenalty ? "Masalan: Darsga asossiz kechikkanlik uchun" : "Masalan: Faol qatnashganlik uchun"}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!errors.name}
              hint={errors.name?.message}
              isRequired
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextArea
              label="Izoh"
              placeholder="Qoida bo'yicha batafsil ma'lumot..."
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              isInvalid={!!errors.description}
              hint={errors.description?.message}
              rows={3}
              isRequired
            />
          )}
        />

        <Controller
          control={control}
          name="coin_amount"
          render={({ field }) => (
            <Input
              label={isPenalty ? "Jarima miqdori (Ball)" : "Ball miqdori"}
              placeholder="100"
              type="number"
              icon={isPenalty ? Minus : Plus}
              iconClassName={isPenalty ? "text-error-solid" : "text-brand-solid"}
              value={field.value === 0 ? "" : Math.abs(field.value).toString()}
              onChange={(v) => {
                if (v === "") {
                  field.onChange(0);
                  return;
                }
                const val = Math.abs(Number(v));
                field.onChange(isPenalty ? -val : val);
              }}
              onBlur={field.onBlur}
              isInvalid={!!errors.coin_amount}
              hint={errors.coin_amount?.message}
              isRequired
            />
          )}
        />

      </form>
    </PremiumFormModal>
  );
}
