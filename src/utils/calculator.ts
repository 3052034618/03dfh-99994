import type { 
  OriginalOrder, 
  OrderItem, 
  AmountSplit, 
  PerformanceDeduction,
  HandlingFeeRule 
} from '@/types';

export interface RefundItemInput {
  itemId: string;
  refundCount: number;
}

export const calculateAmountSplit = (
  order: OriginalOrder,
  refundItems: RefundItemInput[],
  feeRules: HandlingFeeRule[]
): {
  itemSplits: AmountSplit[];
  totalActualRefund: number;
  totalCardDeduction: number;
  totalGiftDeduction: number;
  totalDebtDeduction: number;
  handlingFee: number;
  finalRefund: number;
} => {
  const totalAmount = order.totalAmount || 1;
  const actualRatio = order.actualAmount / totalAmount;
  const cardRatio = order.cardDeduction / totalAmount;
  const giftRatio = order.giftAmount / totalAmount;
  const debtRatio = order.debtAmount / totalAmount;

  const itemSplits: AmountSplit[] = [];
  let totalActualRefund = 0;
  let totalCardDeduction = 0;
  let totalGiftDeduction = 0;
  let totalDebtDeduction = 0;

  const orderItemsMap = new Map(order.items.map(item => [item.id, item]));

  for (const refund of refundItems) {
    const item = orderItemsMap.get(refund.itemId);
    if (!item || refund.refundCount <= 0) continue;

    const refundAmount = item.unitPrice * refund.refundCount;
    const actualPortion = round2(refundAmount * actualRatio);
    const cardPortion = round2(refundAmount * cardRatio);
    const giftPortion = round2(refundAmount * giftRatio);
    const debtPortion = round2(refundAmount * debtRatio);

    itemSplits.push({
      itemId: item.id,
      projectName: item.projectName,
      refundAmount,
      actualPortion,
      cardPortion,
      giftPortion,
      debtPortion,
    });

    totalActualRefund += actualPortion;
    totalCardDeduction += cardPortion;
    totalGiftDeduction += giftPortion;
    totalDebtDeduction += debtPortion;
  }

  totalActualRefund = round2(totalActualRefund);
  totalCardDeduction = round2(totalCardDeduction);
  totalGiftDeduction = round2(totalGiftDeduction);
  totalDebtDeduction = round2(totalDebtDeduction);

  const feeRule = feeRules.find(r => r.paymentMethod === order.paymentMethod);
  let handlingFee = 0;
  if (feeRule) {
    handlingFee = round2(Math.max(feeRule.minFee, totalActualRefund * feeRule.feeRate));
    if (feeRule.maxFee !== undefined) {
      handlingFee = Math.min(handlingFee, feeRule.maxFee);
    }
  }

  const finalRefund = round2(totalActualRefund - handlingFee);

  return {
    itemSplits,
    totalActualRefund,
    totalCardDeduction,
    totalGiftDeduction,
    totalDebtDeduction,
    handlingFee,
    finalRefund,
  };
};

export const calculatePerformanceDeduction = (
  applicationId: string,
  order: OriginalOrder,
  itemSplits: AmountSplit[]
): PerformanceDeduction[] => {
  const deductions: PerformanceDeduction[] = [];
  const splitMap = new Map(itemSplits.map(s => [s.itemId, s]));

  const doctorMap = new Map<string, { name: string; id: string; original: number; deduct: number; }>();
  const consultantMap = new Map<string, { name: string; id: string; original: number; deduct: number; }>();
  const channelMap = new Map<string, { name: string; id: string; original: number; deduct: number; }>();

  for (const item of order.items) {
    const split = splitMap.get(item.id);
    if (!split) continue;

    const itemFullPerformance = (item.unitPrice * item.totalCount) * (item.actualRatio || 1);
    const itemRefundPerformance = split.actualPortion;

    if (item.doctorName) {
      const key = item.doctorName;
      const ratio = item.doctorRatio || 0.3;
      if (!doctorMap.has(key)) {
        doctorMap.set(key, { 
          name: item.doctorName, 
          id: `doctor_${key}`, 
          original: 0, 
          deduct: 0 
        });
      }
      const entry = doctorMap.get(key)!;
      entry.original += round2(itemFullPerformance * ratio);
      entry.deduct += round2(itemRefundPerformance * ratio);
    }

    if (item.consultantName) {
      const key = item.consultantName;
      const ratio = item.consultantRatio || 0.15;
      if (!consultantMap.has(key)) {
        consultantMap.set(key, { 
          name: item.consultantName, 
          id: `consultant_${key}`, 
          original: 0, 
          deduct: 0 
        });
      }
      const entry = consultantMap.get(key)!;
      entry.original += round2(itemFullPerformance * ratio);
      entry.deduct += round2(itemRefundPerformance * ratio);
    }

    if (item.channelName) {
      const key = item.channelName;
      const ratio = item.channelRatio || 0.1;
      if (!channelMap.has(key)) {
        channelMap.set(key, { 
          name: item.channelName, 
          id: `channel_${key}`, 
          original: 0, 
          deduct: 0 
        });
      }
      const entry = channelMap.get(key)!;
      entry.original += round2(itemFullPerformance * ratio);
      entry.deduct += round2(itemRefundPerformance * ratio);
    }
  }

  let idx = 0;
  for (const [, entry] of doctorMap) {
    deductions.push({
      id: `perf_${applicationId}_${idx++}`,
      applicationId,
      role: '医生',
      personName: entry.name,
      personId: entry.id,
      originalPerformance: round2(entry.original),
      deductionAmount: round2(entry.deduct),
      afterPerformance: round2(entry.original - entry.deduct),
    });
  }
  for (const [, entry] of consultantMap) {
    deductions.push({
      id: `perf_${applicationId}_${idx++}`,
      applicationId,
      role: '咨询师',
      personName: entry.name,
      personId: entry.id,
      originalPerformance: round2(entry.original),
      deductionAmount: round2(entry.deduct),
      afterPerformance: round2(entry.original - entry.deduct),
    });
  }
  for (const [, entry] of channelMap) {
    deductions.push({
      id: `perf_${applicationId}_${idx++}`,
      applicationId,
      role: '渠道',
      personName: entry.name,
      personId: entry.id,
      originalPerformance: round2(entry.original),
      deductionAmount: round2(entry.deduct),
      afterPerformance: round2(entry.original - entry.deduct),
    });
  }

  return deductions;
};

export const checkPackageDifference = (
  order: OriginalOrder,
  refundItems: RefundItemInput[]
): boolean => {
  const packageItems = order.items.filter(item => item.type === 'package');
  if (packageItems.length === 0) return false;

  const packageMap = new Map<string, OrderItem[]>();
  for (const item of order.items) {
    if (item.packageId) {
      if (!packageMap.has(item.packageId)) {
        packageMap.set(item.packageId, []);
      }
      packageMap.get(item.packageId)!.push(item);
    }
  }

  const refundItemSet = new Set(refundItems.map(r => r.itemId));

  for (const [, items] of packageMap) {
    const refundedInPackage = items.filter(item => refundItemSet.has(item.id));
    if (refundedInPackage.length > 0 && refundedInPackage.length < items.length) {
      const originalTotal = items.reduce((sum, i) => sum + i.unitPrice * i.totalCount, 0);
      const packagePrice = packageItems.find(p => p.id === items[0].packageId)?.unitPrice || 0;
      if (Math.abs(originalTotal - packagePrice) > 0.01) {
        return true;
      }
    }
  }

  return false;
};

const round2 = (num: number): number => Math.round(num * 100) / 100;

declare module '@/types' {
  interface OrderItem {
    actualRatio?: number;
  }
}
