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
import type { Key } from "react-aria-components";

export function EditRuleModal({ item, onClose }: { item: CoinRule; onClose: () => void }) {
  const updateMutation = useUpdateCoinRule();
  const { data: jobPositions, isLoading: jobsLoading } = useJobPositions(); // Removed arg

  const initialPositions = item.allowed_job_positions
    ? item.allowed_job_positions.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const {
    register,
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
            form="edit-rule-form"
            disabled={isFormLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-solid_hover disabled:opacity-50"
          >
            {isFormLoading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      }
    >
      <form id="edit-rule-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-secondary">
            Qoida nomi
          </label>
          <input
            id="name"
            {...register("name")}
            className="rounded-lg bg-primary px-3 py-2 text-sm text-primary outline-none ring-1 ring-inset ring-secondary focus:ring-2 focus:ring-brand-solid"
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
          />
          {errors.description && <p className="text-xs text-error-primary">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">Coin miqdori</label>
          <input
            readOnly
            disabled
            value={item.coin_amount}
            className="rounded-lg bg-secondary px-3 py-2 text-sm text-tertiary outline-none ring-1 ring-inset ring-secondary opacity-70 cursor-not-allowed"
          />
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
        </div>
      </form>
    </PremiumFormModal>
  );
}
