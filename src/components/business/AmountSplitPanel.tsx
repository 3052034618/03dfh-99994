import type { RefundApplication } from '@/types';
import { Wallet, CreditCard, Gift, AlertCircle, Calculator, Receipt } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import clsx from 'clsx';

interface AmountSplitPanelProps {
  application: RefundApplication;
  showDetails?: boolean;
}

const AmountSplitPanel = ({ application, showDetails = true }: AmountSplitPanelProps) => {
  const rows = [
    { label: '项目退项金额', value: application.actualRefund + application.cardDeduction + application.giftDeduction + application.debtDeduction, icon: Receipt, tip: '退项项目金额合计（含各部分）', color: 'text-neutral-700' },
    { label: '实收金额', value: application.actualRefund, icon: Wallet, tip: '从订单实收中退回', color: 'text-primary-700', highlight: true },
    { label: '耗卡抵扣', value: application.cardDeduction, icon: CreditCard, tip: '使用储值卡抵扣部分，不退回现金', color: 'text-medical-700' },
    { label: '赠送抵扣', value: application.giftDeduction, icon: Gift, tip: '订单赠送部分，不退回', color: 'text-warning-700' },
    { label: '欠款抵扣', value: application.debtDeduction, icon: AlertCircle, tip: '客户未付清部分，从退款中扣除', color: 'text-danger-700' },
  ];

  return (
    <div className="card p-5">
      <h3 className="section-title">
        <span className="w-1 h-5 rounded bg-medical-600" />
        金额拆分核算
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-lg transition-all',
                  row.highlight ? 'bg-primary-50 border border-primary-100' : 'bg-neutral-50 border border-neutral-100 hover:bg-neutral-100/80',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    row.highlight ? 'bg-primary-100 text-primary-600' : 'bg-white border border-neutral-200 text-neutral-500',
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={clsx('text-sm font-medium', row.highlight ? 'text-primary-800' : 'text-neutral-700')}>{row.label}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{row.tip}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={clsx('amount-lg', row.color)}>{formatCurrency(row.value)}</p>
                </div>
              </div>
            );
          })}

          <div className="divider-dashed my-2" />

          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-warning-50 to-danger-50 border border-warning-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-100 text-warning-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">手续费（{application.originalOrder.paymentMethod}）</p>
                <p className="text-[11px] text-neutral-500">按支付通道费率扣除，实退时从实收中扣除</p>
              </div>
            </div>
            <p className="amount-lg text-warning-700">- {formatCurrency(application.handlingFee)}</p>
          </div>
        </div>

        <div className="col-span-1">
          <div className="sticky top-6 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-5 text-white shadow-lg overflow-hidden relative h-full">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              <p className="text-xs text-white/70 font-medium uppercase tracking-wide mb-1">最终实退金额</p>
              <p className="text-3xl font-bold font-mono mb-1">{formatCurrency(application.finalRefund)}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-5">
                <Wallet className="w-3 h-3" />
                原路退回至 {application.originalOrder.paymentMethod}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">实收退款</span>
                  <span className="font-mono font-medium">{formatCurrency(application.actualRefund)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">减 手续费</span>
                  <span className="font-mono font-medium">- {formatCurrency(application.handlingFee)}</span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">耗卡抵扣</span>
                  <span className="font-mono text-medical-300">{formatCurrency(application.cardDeduction)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">赠送抵扣</span>
                  <span className="font-mono text-warning-300">{formatCurrency(application.giftDeduction)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && application.itemSplits.length > 0 && (
        <>
          <div className="divider my-5" />
          <h4 className="section-subtitle mb-3">按项目拆分明细</h4>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th className="text-right">退项金额</th>
                  <th className="text-right">实收部分</th>
                  <th className="text-right">耗卡部分</th>
                  <th className="text-right">赠送部分</th>
                  <th className="text-right">欠款部分</th>
                </tr>
              </thead>
              <tbody>
                {application.itemSplits.map((split) => (
                  <tr key={split.itemId}>
                    <td className="font-medium text-neutral-800">{split.projectName}</td>
                    <td className="text-right amount text-neutral-800 font-semibold">{formatCurrency(split.refundAmount)}</td>
                    <td className="text-right amount text-primary-700">{formatCurrency(split.actualPortion)}</td>
                    <td className="text-right amount text-medical-700">{formatCurrency(split.cardPortion)}</td>
                    <td className="text-right amount text-warning-700">{formatCurrency(split.giftPortion)}</td>
                    <td className="text-right amount text-danger-700">{formatCurrency(split.debtPortion)}</td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 font-semibold">
                  <td className="text-neutral-800">合计</td>
                  <td className="text-right amount text-neutral-900">{formatCurrency(application.actualRefund + application.cardDeduction + application.giftDeduction + application.debtDeduction)}</td>
                  <td className="text-right amount text-primary-800">{formatCurrency(application.actualRefund)}</td>
                  <td className="text-right amount text-medical-800">{formatCurrency(application.cardDeduction)}</td>
                  <td className="text-right amount text-warning-800">{formatCurrency(application.giftDeduction)}</td>
                  <td className="text-right amount text-danger-800">{formatCurrency(application.debtDeduction)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AmountSplitPanel;
