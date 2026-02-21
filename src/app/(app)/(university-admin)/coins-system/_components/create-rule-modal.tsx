import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "@untitledui/icons";

import { useCreateCoinRule } from "@/hooks/api/use-coins";
import { useJobPositions } from "@/hooks/api/use-job-positions";
import { createCoinRuleSchema } from "@/lib/validations/coins";
import type { CreateCoinRuleInput } from "@/lib/validations/coins";

import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Button } from "@/components/base/buttons/button";
import type { Key } from "react-aria-components";

export function CreateRuleModal({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateCoinRule();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions();

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
      allowed_job_position_public_ids: [],
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: CreateCoinRuleInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Coin qoidasi muvaffaqiyatli yaratildi");
      onClose();
    } catch (e: any) {
      toast.error("Xatolik yuz berdi", { description: e.message });
    }
  };

  const jobPositionItems = (jobPositions || []).map((pos) => ({
    id: pos.public_id,
    label: pos.name,
  }));

  const isFormLoading = isSubmitting || createMutation.isPending;

  return (
    <PremiumFormModal
      isOpen={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Yangi coin qoidasi"
      description="Talabalarga qaysi holatda coin berish bo'yicha qoida yarating."
      icon={Plus}
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
            form="create-rule-form"
            color="primary"
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
              placeholder="Masalan: Faol qatnashganlik uchun"
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
              label="Coin miqdori"
              placeholder="100"
              type="number"
              value={String(field.value || "")}
              onChange={(v) => field.onChange(Number(v) || 0)}
              onBlur={field.onBlur}
              isInvalid={!!errors.coin_amount}
              hint={errors.coin_amount?.message}
              isRequired
            />
          )}
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
          <p className="text-xs text-tertiary">
            Ushbu qoida bo'yicha faqat shu lavozimdagi xodimlar talabaga coin bera oladi.
          </p>
        </div>
      </form>
    </PremiumFormModal>
  );
}
