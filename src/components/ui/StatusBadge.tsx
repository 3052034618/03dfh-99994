import type { ApplicationStatus } from '@/types';
import { STATUS_BADGE_CLASS } from '@/utils/constants';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const baseClass = (STATUS_BADGE_CLASS as Record<string, string>)[status] || 'badge-draft';
  return <span className={clsx(baseClass, className)}>{status}</span>;
};

export default StatusBadge;
