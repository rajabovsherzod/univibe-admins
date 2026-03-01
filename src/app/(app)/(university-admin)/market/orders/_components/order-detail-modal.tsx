'use client';

import Image from 'next/image';
import { toHttps } from '@/utils/cx';
import { ShoppingBag02, X } from '@untitledui/icons';
import { useAdminOrderDetail } from '../_hooks/use-orders-admin';
import { useProducts } from '../../_hooks/use-products';
import { Badge } from '@/components/base/badges/badges';
import type { BadgeColors } from '@/components/base/badges/badge-types';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusInfo(status: string): { color: BadgeColors; label: string } {
  if (status === 'PENDING') return { color: 'brand', label: 'Kutilmoqda' };
  if (status === 'FULFILLED') return { color: 'success', label: 'Bajarildi' };
  if (status === 'CANCELED') return { color: 'error', label: 'Bekor qilindi' };
  if (status === 'RETURNED') return { color: 'gray', label: 'Qaytarildi' };
  return { color: 'gray', label: status };
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: order, isPending: orderLoading } = useAdminOrderDetail(orderId);
  const { data: productsData } = useProducts({ page_size: 100 });

  const productImageMap = new Map(
    (productsData?.results ?? []).map((p) => [p.public_id, p.image])
  );

  const { color, label } = order ? statusInfo(order.status) : { color: 'gray' as BadgeColors, label: '' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-primary border border-secondary shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary shrink-0">
          <div>
            <h2 className="text-base font-bold text-primary">Buyurtma ma&apos;lumotlari</h2>
            {order && (
              <p className="text-xs text-tertiary font-mono mt-0.5">
                #{orderId.split('-')[0].toUpperCase()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-tertiary hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {orderLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : !order ? (
            <div className="p-8 text-center text-sm text-tertiary">
              Ma&apos;lumot topilmadi
            </div>
          ) : (
            <div className="p-5 space-y-5">

              {/* Student + Status */}
              <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-secondary">
                <div>
                  <p className="text-[11px] font-semibold text-tertiary uppercase tracking-wider mb-1">Talaba</p>
                  <p className="text-sm font-bold text-primary">{order.student_name}</p>
                </div>
                <Badge color={color} size="sm">{label}</Badge>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-primary mb-2">Buyurtma tarkibi</p>
                <div className="rounded-xl border border-secondary overflow-hidden divide-y divide-secondary">
                  {(order.items && order.items.length > 0) ? order.items.map((item) => {
                    const image = productImageMap.get(item.product_public_id) ?? null;
                    return (
                      <div key={item.product_public_id} className="flex items-center gap-3 p-3">
                        {/* Product image */}
                        <div className="size-12 rounded-lg bg-tertiary overflow-hidden shrink-0 border border-secondary">
                          {image ? (
                            <Image
                              src={toHttps(image)!}
                              alt={item.product_name_snapshot}
                              width={48}
                              height={48}
                              className="size-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <ShoppingBag02 size={20} className="text-quaternary" />
                            </div>
                          )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">
                            {item.product_name_snapshot}
                          </p>
                          <p className="text-xs text-tertiary mt-0.5">
                            {item.quantity} × {item.unit_price_snapshot.toLocaleString()} coin
                          </p>
                        </div>

                        {/* Line total */}
                        <div className="shrink-0 flex items-center gap-1 text-sm font-bold text-brand-solid">
                          {item.line_total_snapshot.toLocaleString()}
                          <CoinOutlineIcon size={14} color="currentColor" strokeWidth={22} />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-4 text-center text-sm text-tertiary">
                      Mahsulot ma&apos;lumotlari mavjud emas
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-secondary">Jami to&apos;lov</span>
                <span className="flex items-center gap-2 text-2xl font-bold text-brand-solid">
                  {order.total_coins.toLocaleString()}
                  <CoinOutlineIcon size={22} color="currentColor" strokeWidth={20} />
                </span>
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-secondary divide-y divide-secondary overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-tertiary">Yaratildi</span>
                  <span className="text-xs font-medium text-primary">{formatDate(order.created_at)}</span>
                </div>
                {order.fulfilled_at && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-tertiary">Tasdiqlandi</span>
                    <span className="text-xs font-medium text-success-600">{formatDate(order.fulfilled_at)}</span>
                  </div>
                )}
                {order.returned_at && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-tertiary">Qaytarildi</span>
                    <span className="text-xs font-medium text-secondary">{formatDate(order.returned_at)}</span>
                  </div>
                )}
                {order.processed_by_name && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-tertiary">Kim tasdiqladi</span>
                    <span className="text-xs font-semibold text-primary">{order.processed_by_name}</span>
                  </div>
                )}
              </div>

              {/* Rejection reason */}
              {order.returned_reason && (
                <div className="p-3.5 rounded-xl bg-error-50 dark:bg-error-600/10 border border-error-200 dark:border-error-600/20">
                  <p className="text-[11px] font-bold text-error-600 dark:text-error-400 uppercase tracking-wider mb-1">
                    Rad etish sababi
                  </p>
                  <p className="text-sm text-error-700 dark:text-error-300 leading-relaxed">
                    {order.returned_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
