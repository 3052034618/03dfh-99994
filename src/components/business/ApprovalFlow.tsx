import { Check, X, Clock, User } from 'lucide-react';
import type { ApprovalNode } from '@/types';
import clsx from 'clsx';
import { formatDateTime } from '@/utils/format';

interface ApprovalFlowProps {
  nodes: ApprovalNode[];
  currentNode: number;
}

const ApprovalFlow = ({ nodes, currentNode }: ApprovalFlowProps) => {
  return (
    <div className="card p-5">
      <h3 className="section-title">
        <span className="w-1 h-5 rounded bg-primary-600" />
        审批流程
      </h3>
      <div className="relative">
        <div className="absolute top-9 left-0 right-0 h-0.5 bg-neutral-200 mx-12" />
        <div className="relative flex items-start justify-between">
          {nodes.map((node, idx) => {
            const isDone = node.status === 'approved' || node.status === 'skipped';
            const isCurrent = idx === currentNode && node.status === 'pending';
            const isRejected = node.status === 'rejected';

            return (
              <div key={node.id} className="flex flex-col items-center relative z-10 flex-1 min-w-0 px-2">
                <div className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  isDone && 'bg-success-500 text-white shadow-lg shadow-success-200 scale-100',
                  isCurrent && 'bg-primary-600 text-white shadow-lg shadow-primary-200 animate-pulse-slow',
                  isRejected && 'bg-danger-500 text-white shadow-lg shadow-danger-200',
                  !isDone && !isCurrent && !isRejected && 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200',
                )}>
                  {isDone ? <Check className="w-6 h-6" /> :
                   isRejected ? <X className="w-6 h-6" /> :
                   isCurrent ? <Clock className="w-5 h-5" /> :
                   <User className="w-5 h-5" />}
                </div>

                <div className="mt-3 text-center w-full max-w-[140px]">
                  <p className={clsx(
                    'text-sm font-semibold leading-tight',
                    isDone && 'text-success-700',
                    isCurrent && 'text-primary-700',
                    isRejected && 'text-danger-700',
                    !isDone && !isCurrent && !isRejected && 'text-neutral-500',
                  )}>
                    {node.nodeName}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{node.approverRole}</p>
                  {node.approverName && (
                    <p className="text-[11px] font-medium text-neutral-600 mt-1 truncate">{node.approverName}</p>
                  )}
                  {node.operatedAt && (
                    <p className="text-[10px] text-neutral-400 mt-1">{formatDateTime(node.operatedAt)}</p>
                  )}
                  {node.opinion && (
                    <div className={clsx(
                      'mt-2 p-2 rounded text-[11px] text-left leading-relaxed',
                      isRejected ? 'bg-danger-50 text-danger-700 border border-danger-100' : 'bg-neutral-50 text-neutral-600 border border-neutral-100'
                    )}>
                      {node.opinion}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalFlow;
