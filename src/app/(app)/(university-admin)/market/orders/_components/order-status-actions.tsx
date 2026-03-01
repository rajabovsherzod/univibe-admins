import { useState } from 'react';
import { useUpdateOrderStatus, type AdminOrder, type OrderStatus } from '../_hooks/use-orders-admin';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { CheckCircle, XCircle } from '@untitledui/icons';

interface StatusButtonProps {
  order: AdminOrder;
  currentStatus: OrderStatus;
}

export function OrderStatusActions({ order, currentStatus }: StatusButtonProps) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    updateStatus(
      { id: order.public_id, data: { status: 'FULFILLED' } },
      {
        onSuccess: () => toast.success("Buyurtma tasdiqlandi"),
        onError: () => toast.error("Tasdiqlashda xatolik yuz berdi"),
      }
    );
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Rad etish sababini kiritish majburiy");
      return;
    }

    updateStatus(
      { id: order.public_id, data: { status: 'CANCELED', returned_reason: rejectReason } },
      {
        onSuccess: () => {
          toast.success("Buyurtma rad etildi");
          setShowRejectModal(false);
        },
        onError: () => toast.error("Xatolik yuz berdi"),
      }
    );
  };

  if (currentStatus !== 'PENDING') return null;

  return (
    <>
      <Tooltip title="Tasdiqlash" delay={200} color="success">
        <button
          className="rounded-full p-1.5 text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10 transition-colors disabled:opacity-50 focus:outline-none"
          onClick={handleApprove}
          disabled={isPending}
          aria-label="Tasdiqlash"
        >
          <CheckCircle className="size-6" />
        </button>
      </Tooltip>
      <Tooltip title="Rad etish" delay={200} color="error">
        <button
          className="rounded-full p-1.5 text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors disabled:opacity-50 focus:outline-none"
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          aria-label="Rad etish"
        >
          <XCircle className="size-6" />
        </button>
      </Tooltip>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <form onSubmit={handleRejectSubmit} className="relative w-full max-w-sm rounded-2xl bg-primary border border-secondary shadow-xl overflow-hidden p-6">
            <h3 className="text-base font-semibold text-primary mb-2">Rad etish sababi</h3>
            <p className="text-sm text-tertiary mb-4">Iltimos, nima uchun ushbu buyurtma rad etilganini kiriting.</p>

            <textarea
              className="w-full h-24 p-3 mb-6 rounded-xl border border-secondary bg-secondary text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow resize-none"
              placeholder="Masalan: Mahsulot omborda qolmagan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={isPending}
                className="flex-1 h-10 rounded-lg border border-secondary bg-primary text-sm font-semibold text-secondary hover:bg-secondary transition-colors disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-10 rounded-lg bg-error-600 hover:bg-error-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {isPending ? "Saqlanmoqda..." : "Rad etish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
