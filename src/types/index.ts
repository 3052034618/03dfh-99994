export type MemberLevel = '普通' | '银卡' | '金卡' | '钻石';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  memberLevel: MemberLevel;
  totalSpent: number;
  refundCount: number;
  createdAt: string;
}

export type PaymentMethod = '微信' | '支付宝' | '银行卡' | '现金' | '储值卡';

export type OrderItemType = 'normal' | 'gift' | 'package';

export interface OrderItem {
  id: string;
  orderId: string;
  projectName: string;
  unitPrice: number;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  refundCount: number;
  type: OrderItemType;
  packageId?: string;
  doctorName?: string;
  consultantName?: string;
  channelName?: string;
  doctorRatio?: number;
  consultantRatio?: number;
  channelRatio?: number;
}

export interface OriginalOrder {
  id: string;
  orderNo: string;
  customerId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  actualAmount: number;
  cardDeduction: number;
  giftAmount: number;
  debtAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: OrderItem[];
  consultantName: string;
}

export interface AmountSplit {
  itemId: string;
  projectName: string;
  refundAmount: number;
  actualPortion: number;
  cardPortion: number;
  giftPortion: number;
  debtPortion: number;
}

export type PerformanceRole = '医生' | '咨询师' | '渠道';

export interface PerformanceDeduction {
  id: string;
  applicationId: string;
  role: PerformanceRole;
  personName: string;
  personId: string;
  originalPerformance: number;
  deductionAmount: number;
  afterPerformance: number;
}

export type RefundMethod = '原路退回' | '转余额' | '抵扣新单';

export type ApplicationStatus = 
  | '草稿' 
  | '待财务复核' 
  | '财务退回' 
  | '待店长审批' 
  | '店长驳回' 
  | '待到账登记' 
  | '已完成' 
  | '已取消';

export type ApprovalNodeStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface ApprovalNode {
  id: string;
  nodeIndex: number;
  nodeName: string;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: ApprovalNodeStatus;
  opinion?: string;
  operatedAt?: string;
}

export interface RefundApplication {
  id: string;
  applicationNo: string;
  customerId: string;
  customer: Customer;
  originalOrderId: string;
  originalOrder: OriginalOrder;
  storeId: string;
  storeName: string;
  applicantId: string;
  applicantName: string;
  
  actualRefund: number;
  cardDeduction: number;
  giftDeduction: number;
  debtDeduction: number;
  handlingFee: number;
  finalRefund: number;
  
  itemSplits: AmountSplit[];
  performanceDeductions: PerformanceDeduction[];
  
  refundMethod?: RefundMethod;
  relatedNewOrderId?: string;
  
  hasDifference: boolean;
  differenceReason?: string;
  remark?: string;
  
  status: ApplicationStatus;
  currentNode: number;
  approvalFlow: ApprovalNode[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AuditLogStateChange {
  statusBefore?: string;
  statusAfter?: string;
  finalRefundBefore?: number;
  finalRefundAfter?: number;
  refundMethodBefore?: string;
  refundMethodAfter?: string;
  currentNodeBefore?: number;
  currentNodeAfter?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string;
  ip?: string;
  createdAt: string;
  stateChange?: AuditLogStateChange;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  managerName: string;
  phone: string;
}

export interface HandlingFeeRule {
  paymentMethod: PaymentMethod;
  feeRate: number;
  minFee: number;
  maxFee?: number;
}

export interface User {
  id: string;
  name: string;
  role: '前台顾问' | '财务主管' | '门店店长' | '咨询师';
  storeId?: string;
  storeName?: string;
  avatar?: string;
}

export interface ApplicationsFilter {
  storeId?: string;
  status?: ApplicationStatus;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  applicantName?: string;
}

export interface StoreReportData {
  storeId: string;
  storeName: string;
  refundCount: number;
  refundAmount: number;
  performanceDeduction: number;
  differenceCount: number;
}

export interface ConsultantRanking {
  rank: number;
  consultantName: string;
  storeName: string;
  refundCount: number;
  refundAmount: number;
  performanceDeduction: number;
}

export interface TrendData {
  date: string;
  refundCount: number;
  refundAmount: number;
}

export interface ReportData {
  totalRefundAmount: number;
  totalRefundCount: number;
  avgRefundAmount: number;
  totalPerformanceDeduction: number;
  differenceCount: number;
  storeReports: StoreReportData[];
  consultantRankings: ConsultantRanking[];
  trendData: TrendData[];
}
