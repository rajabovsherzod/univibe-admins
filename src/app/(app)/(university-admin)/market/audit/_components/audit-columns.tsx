import type { DataTableColumn } from '@/components/application/table/data-table';
import type { RedemptionAuditLog } from '../../_hooks/use-redemption-audit';
import { Badge } from '@/components/base/badges/badges';
import type { BadgeColors } from '@/components/base/badges/badge-types';
import { CoinOutlineIcon } from '@/components/custom-icons/brand-icon';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const auditColumns: DataTableColumn<RedemptionAuditLog>[] = [
  {
    id: 'actor_name',
    header: 'Foydalanuvchi',
    cell: (row) => (
      <span className="font-medium text-primary">{row.actor_name || 'Tizim'}</span>
    ),
  },
  {
    id: 'order_public_id',
    header: 'Buyurtma ID',
    cell: (row) => (
      <span className="text-secondary font-mono text-xs" title={row.order_public_id}>
        {row.order_public_id.split('-')[0]}...
      </span>
    ),
  },
  {
    id: 'action',
    header: 'Harakat',
    cell: (row) => {
      const action = row.action;
      let color: BadgeColors = 'gray';
      let label: string = action;

      if (action === 'CREATED') { color = 'brand'; label = 'Yaratildi'; }
      else if (action === 'FULFILLED') { color = 'success'; label = 'Bajarildi'; }
      else if (action === 'CANCELED') { color = 'error'; label = 'Bekor qilindi'; }
      else if (action === 'RETURNED') { color = 'gray'; label = 'Qaytarildi'; }

      return <Badge color={color} size="sm">{label}</Badge>;
    },
  },
  {
    id: 'delta_coins',
    header: 'Ballar',
    cell: (row) => {
      const amount = row.delta_coins;
      const isPositive = amount > 0;
      return (
        <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
          {isPositive ? '+' : ''}{amount.toLocaleString()}
          <CoinOutlineIcon size={13} color="currentColor" strokeWidth={24} />
        </span>
      );
    },
  },
  {
    id: 'after_balance',
    header: 'Balans',
    cell: (row) => (
      <span className="inline-flex items-center gap-1 text-secondary tabular-nums font-medium">
        {row.after_balance.toLocaleString()}
        <CoinOutlineIcon size={13} color="currentColor" strokeWidth={24} />
      </span>
    ),
  },
  {
    id: 'created_at',
    header: 'Sana',
    cell: (row) => (
      <span className="text-secondary text-sm whitespace-nowrap">
        {formatDate(row.created_at)}
      </span>
    ),
  },
];
