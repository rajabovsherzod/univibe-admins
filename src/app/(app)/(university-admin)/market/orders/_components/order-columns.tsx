import type { DataTableColumn } from '@/components/application/table/data-table';
import type { AdminOrder } from '../_hooks/use-orders-admin';
import { OrderStatusActions } from './order-status-actions';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';
import { Badge } from '@/components/base/badges/badges';
import type { BadgeColors } from '@/components/base/badges/badge-types';
import { Button } from '@/components/base/buttons/button';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Eye } from '@untitledui/icons';

export function createOrderColumns(onView: (id: string) => void): DataTableColumn<AdminOrder>[] {
  return [
    {
      id: 'student',
      header: 'Talaba',
      cell: (row) => (
        <div>
          <div className="font-semibold text-primary">{row.student_name}</div>
          <div className="text-xs text-secondary font-mono mt-0.5" title={row.student_public_id}>
            {row.student_public_id.split('-')[0]}...
          </div>
        </div>
      ),
    },
    {
      id: 'total_coins',
      header: 'Narxi',
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 font-bold text-sm text-brand-solid">
          {row.total_coins.toLocaleString()}
          <CoinOutlineIcon size={16} color="currentColor" strokeWidth={22} />
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Soni',
      cell: (row) => (
        <span className="text-sm font-medium text-secondary">
          {row.item_count || '1'} dona
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Holati',
      cell: (row) => {
        const status = row.status;
        let color: BadgeColors = 'gray';
        let label: string = status;

        if (status === 'PENDING') {
          color = 'brand';
          label = 'Kutilmoqda';
        } else if (status === 'FULFILLED') {
          color = 'success';
          label = 'Bajarildi';
        } else if (status === 'CANCELED') {
          color = 'error';
          label = 'Bekor qilindi';
        } else if (status === 'RETURNED') {
          color = 'gray';
          label = 'Qaytarildi';
        }

        return <Badge color={color} size="sm">{label}</Badge>;
      },
    },
    {
      id: 'created_at',
      header: 'Buyurtma vaqti',
      cell: (row) => {
        const date = new Date(row.created_at);
        return (
          <span className="text-sm text-secondary whitespace-nowrap">
            {date.toLocaleString('ru-RU', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      headClassName: 'w-28',
      cellClassName: 'w-28',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Tooltip title="Ko'rish" delay={200} color="brand">
            <Button
              size="sm"
              color="secondary"
              iconLeading={Eye}
              onClick={() => onView(row.public_id)}
            />
          </Tooltip>
          <OrderStatusActions order={row} currentStatus={row.status} />
        </div>
      ),
    },
  ];
}
