import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface DifferenceAlertProps {
  reason?: string;
  onReasonChange?: (reason: string) => void;
  editable?: boolean;
}

const DifferenceAlert = ({ reason, onReasonChange, editable = false }: DifferenceAlertProps) => {
  return (
    <div className={clsx(
      'rounded-xl p-4 border-2 border-dashed transition-all',
      editable ? 'bg-danger-50/60 border-danger-300 animate-pulse-slow' : 'bg-warning-50 border-warning-200',
    )}>
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          editable ? 'bg-danger-100 text-danger-600' : 'bg-warning-100 text-warning-600',
        )}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={clsx(
              'font-semibold',
              editable ? 'text-danger-800' : 'text-warning-800',
            )}>
              套餐拆项金额差异提醒
            </h4>
            <span className="badge badge-difference">需审核确认</span>
          </div>
          <p className={clsx('text-sm mb-3', editable ? 'text-danger-700' : 'text-warning-700')}>
            检测到本次退项涉及套餐拆项，拆分后项目总价与套餐原价不一致，或客户选择部分退项，请录入原因说明后方可提交审批。
          </p>

          {editable ? (
            <div>
              <label className="text-xs font-semibold text-danger-800 mb-1.5 block">
                差异原因说明 <span className="text-danger-600">*</span>
              </label>
              <textarea
                value={reason || ''}
                onChange={(e) => onReasonChange?.(e.target.value)}
                placeholder="请详细说明本次退项产生差异的原因，例如：客户只做部分项目、套餐优惠拆分规则调整等..."
                rows={3}
                className="input resize-none bg-white border-danger-200 focus:border-danger-400 focus:ring-danger-200"
              />
              {!reason && (
                <p className="text-[11px] text-danger-600 mt-1.5">请填写差异原因，财务复核时将重点审核此内容</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-white/80 p-3 border border-warning-200">
              <p className="text-xs font-semibold text-warning-800 mb-1">申请人说明：</p>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{reason || '（未填写说明）'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DifferenceAlert;
