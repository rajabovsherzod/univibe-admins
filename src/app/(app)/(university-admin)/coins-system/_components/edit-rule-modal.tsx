import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Edit05 } from "@untitledui/icons";

import { useUpdateCoinRule } from "@/hooks/api/use-coins";
import { useJobPositions } from "@/hooks/api/use-job-positions";
import { updateCoinRuleSchema } from "@/lib/validations/coins";
import type { UpdateCoinRuleInput } from "@/lib/validations/coins";
import type { CoinRule } from "@/lib/api/types";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/base/buttons/button";
import type { Key } from "react-aria-components";

export function EditRuleModal({ item, onClose }: { item: CoinRule; onClose: () => void }) {
  const updateMutation = useUpdateCoinRule();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions();

  const initialPositions = item.allowed_job_positions
    ? item.allowed_job_positions.split(",").map(s => s.trim()).filter(Boolean)
    : [];

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
      allowed_job_position_public_ids: initialPositions,
    },
  });

  const onSubmit = async (data: UpdateCoinRuleInput) => {
    try {
      await updateMutation.mutateAsync({ id: item.public_id, data });
      toast.success("Coin qoidasi muvaffaqiyatli tahrirlandi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik yuz berdi", { description: e.message });
    }
  };

  const jobPositionItems = (jobPositions || []).map((pos) => ({
    id: pos.public_id,
    label: pos.name,
  }));

  const isFormLoading = isSubmitting || updateMutation.isPending;

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Qoidani tahrirlash"
      description="Coin miqdorini ushbu bosqichda tahrirlab bo'lmaydi."
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
            showTextWhileLoading
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

        <Input
          label="Coin miqdori"
          value={String(item.coin_amount)}
          isDisabled
          isReadOnly
        />

        <div className="flex flex-col gap-1.5">
          <Controller
            control={control}
            name="allowed_job_position_public_ids"
            render={({ field: { value } }) => (
              <MultiSelect
                id="job_positions"
                label="Ruxsat etilgan lavozimlar"
                selectedKeys={new Set(value)}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys as Iterable<Key>).map(String);
                  setValue("allowed_job_position_public_ids", arr, {
                    shouldValidate: true,
                  });
                }}
                items={jobPositionItems}
                isInvalid={!!errors.allowed_job_position_public_ids}
                isDisabled={jobsLoading || isFormLoading}
                placeholder={jobsLoading ? "Lavozimlar yuklanmoqda..." : "Lavozimni tanlang"}
              >
                {(item) => <MultiSelect.Item id={item.id} label={item.label} />}
              </MultiSelect>
            )}
          />
          {errors.allowed_job_position_public_ids && (
            <p className="text-xs text-error-primary">{errors.allowed_job_position_public_ids.message}</p>
          )}
        </div>
      </form>
    </PremiumFormModal>
  );
}
