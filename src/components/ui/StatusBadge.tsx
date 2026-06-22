import type { ApplicationStatus } from '@/types';
import { STATUS_BADGE_CLASS } from '@/utils/constants';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const baseClass = STATUS_BADGE_CLASS[status] || 'badge-draft';
  return <span className={clsx(baseClass, className)}>{status}</span>;
};

export default StatusBadge;
