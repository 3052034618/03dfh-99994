import type { MemberLevel } from '@/types';
import { MEMBER_LEVEL_COLORS } from '@/utils/constants';
import { User } from 'lucide-react';
import clsx from 'clsx';
import { formatPhone } from '@/utils/format';

interface CustomerInfoCardProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
    memberLevel: MemberLevel;
    totalSpent: number;
    refundCount: number;
  };
  compact?: boolean;
}

const avatarColors = [
  'from-primary-400 to-primary-600',
  'from-medical-400 to-medical-600',
  'from-warning-400 to-warning-600',
  'from-danger-400 to-danger-600',
  'from-purple-400 to-purple-600',
];

const CustomerInfoCard = ({ customer, compact = false }: CustomerInfoCardProps) => {
  const colorIdx = customer.name.charCodeAt(0) % avatarColors.length;
  const gradient = avatarColors[colorIdx];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={clsx('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold flex-shrink-0', gradient)}>
          {customer.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-neutral-800 truncate">{customer.name}</p>
            <span className={clsx('badge', MEMBER_LEVEL_COLORS[customer.memberLevel], 'text-[10px] px-1.5 py-0')}>
              {customer.memberLevel}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">{formatPhone(customer.phone)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="section-title">
        <span className="w-1 h-5 rounded bg-medical-600" />
        客户信息
      </h3>
      <div className="flex items-start gap-4">
        <div className={clsx('w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md', gradient)}>
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <h4 className="text-lg font-bold text-neutral-900">{customer.name}</h4>
            <span className={clsx('badge', MEMBER_LEVEL_COLORS[customer.memberLevel])}>
              {customer.memberLevel}会员
            </span>
            {customer.refundCount > 2 && (
              <span className="badge badge-rejected">高频退款客户</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">手机号</p>
              <p className="font-mono text-neutral-700">{formatPhone(customer.phone)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">累计消费</p>
              <p className="amount text-primary-700 font-semibold">¥{customer.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">历史退款</p>
              <p className={clsx('amount font-semibold', customer.refundCount > 0 ? 'text-warning-700' : 'text-neutral-600')}>
                {customer.refundCount} 次
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;
