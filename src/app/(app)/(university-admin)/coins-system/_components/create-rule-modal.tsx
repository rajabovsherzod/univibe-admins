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
import type { Key } from "react-aria-components";

export function CreateRuleModal({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateCoinRule();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions(); // Removed arg

  const {
    register,
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
          <button
            type="button"
            onClick={onClose}
            disabled={isFormLoading}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary shadow-xs ring-1 ring-inset ring-secondary transition hover:bg-secondary_hover disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="create-rule-form"
            disabled={isFormLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover disabled:opacity-50"
          >
            {isFormLoading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      }
    >
      <form id="create-rule-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-secondary">
            Qoida nomi
          </label>
          <input
            id="name"
            {...register("name")}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid"
            placeholder="Masalan: Faol qatnashganlik uchun"
          />
          {errors.name && <p className="text-xs text-error-primary">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-secondary">
            Izoh
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="min-h-[80px] rounded-lg bg-primary px-3 py-2 text-sm text-primary outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid resize-none"
            placeholder="Qoida bo'yicha batafsil ma'lumot..."
          />
          {errors.description && <p className="text-xs text-error-primary">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="coin_amount" className="text-sm font-medium text-secondary">
            Coin miqdori
          </label>
          <input
            id="coin_amount"
            type="number"
            {...register("coin_amount", { valueAsNumber: true })}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid"
            placeholder="100"
          />
          {errors.coin_amount && <p className="text-xs text-error-primary">{errors.coin_amount.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="job_positions" className="text-sm font-medium text-secondary">
            Ruxsat etilgan lavozimlar
          </label>
          <Controller
            control={control}
            name="allowed_job_position_public_ids"
            render={({ field: { value } }) => (
              <MultiSelect
                id="job_positions"
                label="Lavozimlarni tanlang"
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
