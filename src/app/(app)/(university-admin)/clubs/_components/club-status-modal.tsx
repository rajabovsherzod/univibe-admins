'use client';

import { useForm, Controller } from 'react-hook-form';
import { useAdminUpdateClubStatus } from '@/hooks/api/use-clubs-admin';
import { ClubList, UpdateClubStatusPayload } from '@/types/clubs';
import { PremiumFormModal } from '@/components/application/modals/premium-modal';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { Loader2, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ClubStatusModalProps {
  club: ClubList;
  isOpen: boolean;
  onClose: () => void;
}

export function ClubStatusModal({ club, isOpen, onClose }: ClubStatusModalProps) {
  const { control, handleSubmit, reset } = useForm<UpdateClubStatusPayload>();
  const { mutate: updateStatus, isPending } = useAdminUpdateClubStatus();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset({ status: club.status });
    }
  }, [club, isOpen, reset]);

  const onSubmit = (data: UpdateClubStatusPayload) => {
    updateStatus(
      { clubId: club.public_id, data },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Klub holatini o'zgartirish"
      description="Klubning faollik holatini tahrirlang."
      icon={Settings2}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button color="secondary" type="button" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="club-status-form" isDisabled={isPending} isLoading={isPending}>
            Saqlash
          </Button>
        </div>
      }
    >
      <form id="club-status-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                isOpen={isSelectOpen}
                onOpenChange={setIsSelectOpen}
                selectedKey={field.value}
                onSelectionChange={(val) => {
                  field.onChange(val);
                  setIsSelectOpen(false);
                }}
                label="Yangi holatni tanlang"
              >
                <Select.Item id="ACTIVE" label="Faol" />
                <Select.Item id="INACTIVE" label="Nofaol" />
                <Select.Item id="ARCHIVED" label="Arxivlangan" />
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Nofaol (INACTIVE):</strong> Klub talabalarga ko'rinadi, lekin unga qo'shilish imkoni cheklanadi. <br/>
            <strong>Arxivlangan (ARCHIVED):</strong> Klub butunlay tizimdan yashiriladi va talabalarga umuman ko'rinmaydi.
          </p>
        </div>

      </form>
    </PremiumFormModal>
  );
}
