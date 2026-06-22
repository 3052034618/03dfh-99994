import type { PaymentMethod, ApplicationStatus } from '@/types';

export const MEMBER_LEVEL_COLORS: Record<string, string> = {
  '普通': 'bg-neutral-100 text-neutral-600',
  '银卡': 'bg-slate-200 text-slate-700',
  '金卡': 'bg-amber-100 text-amber-700',
  '钻石': 'bg-sky-100 text-sky-700',
};

export const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  '草稿': 'badge-draft',
  '待财务复核': 'badge-pending',
  '财务退回': 'badge-rejected',
  '待店长审批': 'badge-pending',
  '店长驳回': 'badge-rejected',
  '待到账登记': 'badge-pending',
  '已完成': 'badge-completed',
  '已取消': 'badge-draft',
};

export const PAYMENT_METHODS: PaymentMethod[] = ['微信', '支付宝', '银行卡', '现金', '储值卡'];

export const DEFAULT_HANDLING_FEE_RULES = [
  { paymentMethod: '微信' as PaymentMethod, feeRate: 0.006, minFee: 0.1 },
  { paymentMethod: '支付宝' as PaymentMethod, feeRate: 0.006, minFee: 0.1 },
  { paymentMethod: '银行卡' as PaymentMethod, feeRate: 0.005, minFee: 1 },
  { paymentMethod: '现金' as PaymentMethod, feeRate: 0, minFee: 0 },
  { paymentMethod: '储值卡' as PaymentMethod, feeRate: 0, minFee: 0 },
];

export const APPROVAL_FLOW_TEMPLATE = [
  { nodeIndex: 0, nodeName: '创建申请', approverRole: '前台顾问' },
  { nodeIndex: 1, nodeName: '财务复核', approverRole: '财务主管' },
  { nodeIndex: 2, nodeName: '店长审批', approverRole: '门店店长' },
  { nodeIndex: 3, nodeName: '到账登记', approverRole: '前台顾问' },
  { nodeIndex: 4, nodeName: '完成归档', approverRole: '系统' },
];
