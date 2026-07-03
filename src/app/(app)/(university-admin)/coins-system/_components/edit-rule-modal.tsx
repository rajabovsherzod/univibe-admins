import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit05, Minus, Plus } from "@untitledui/icons";

import { useUpdateCoinRule } from "@/hooks/api/use-coins";
import { useJobPositions } from "@/hooks/api/use-job-positions";
import { updateCoinRuleSchema } from "@/lib/validations/coins";
import type { UpdateCoinRuleInput } from "@/lib/validations/coins";
import type { CoinRule } from "@/lib/api/types";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/base/buttons/button";

export function EditRuleModal({ item, onClose }: { item: CoinRule; onClose: () => void }) {
  const updateMutation = useUpdateCoinRule();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCoinRuleInput>({
    resolver: zodResolver(updateCoinRuleSchema) as any,
    defaultValues: {
      name: item.name,
      description: item.description,
      coin_amount: item.coin_amount,
    },
  });

  const onSubmit = async (data: UpdateCoinRuleInput) => {
    try {
      await updateMutation.mutateAsync({ id: item.public_id, data });
      toast.success("Ball qoidasi muvaffaqiyatli tahrirlandi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik yuz berdi", { description: e.message });
    }
  };

  const isFormLoading = isSubmitting || updateMutation.isPending;

  const isUsed = item.usage_count > 0;

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Qoidani tahrirlash"
      description={isUsed ? "Ushbu qoida bo'yicha allaqachon ball berilganligi sababli, uning miqdorini tahrirlab bo'lmaydi." : "Qoida bo'yicha hali ball berilmagan bo'lsa, uning barcha ma'lumotlarini bemalol tahrirlashingiz mumkin."}
      icon={Edit05}
      iconBgClassName="bg-brand-soft"
      iconClassName="text-brand-solid"
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
            form="edit-rule-form"
            color="primary"
            size="md"
            isLoading={isFormLoading}
          >
            {isFormLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      }
    >
      <form id="edit-rule-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Qoida nomi"
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
          render={({ field }) => {
            const isPenalty = item.coin_amount < 0;
            return (
              <Input
                label="Ball miqdori"
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
                hint={isUsed ? "Ball berib bo'lingan qoidaning miqdorini tahrirlab bo'lmaydi." : errors.coin_amount?.message}
                isRequired
                isDisabled={isUsed}
              />
            );
          }}
        />
      </form>
    </PremiumFormModal>
  );
}
