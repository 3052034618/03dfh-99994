import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color: 'primary' | 'warning' | 'success' | 'danger';
  subtitle?: string;
}

const colorMap = {
  primary: {
    bg: 'from-primary-500 to-primary-700',
    text: 'text-primary-600',
    lightBg: 'bg-primary-50',
    border: 'border-primary-100',
  },
  warning: {
    bg: 'from-warning-400 to-warning-600',
    text: 'text-warning-600',
    lightBg: 'bg-warning-50',
    border: 'border-warning-100',
  },
  success: {
    bg: 'from-success-400 to-success-600',
    text: 'text-success-600',
    lightBg: 'bg-success-50',
    border: 'border-success-100',
  },
  danger: {
    bg: 'from-danger-400 to-danger-600',
    text: 'text-danger-600',
    lightBg: 'bg-danger-50',
    border: 'border-danger-100',
  },
};

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color, subtitle }: StatCardProps) => {
  const colors = colorMap[color];
  return (
    <div className={clsx('stat-card group', 'hover:-translate-y-0.5')}>
      <div className={clsx('stat-card-bg bg-gradient-to-br', colors.bg)} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors.lightBg, colors.text)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="amount-xl text-neutral-900">{value}</p>
          </div>
          {trend !== undefined && (
            <div className={clsx(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              trend >= 0
                ? 'bg-success-50 text-success-700'
                : 'bg-danger-50 text-danger-700'
            )}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
              {trendLabel && <span className="opacity-70 ml-0.5">{trendLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
