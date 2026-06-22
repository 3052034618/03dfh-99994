import { create } from 'zustand';
import type {
  RefundApplication, ApplicationsFilter, Customer, OriginalOrder,
  Store, User, AuditLog, AuditLogStateChange, HandlingFeeRule, ReportData, ApplicationStatus,
  RefundMethod,
} from '@/types';
import { mockApplications, mockAuditLogs } from '@/mock/data/applications';
import { mockCustomers, mockOrders, mockStores } from '@/mock/data/base';
import { mockReportData } from '@/mock/data/reports';
import { DEFAULT_HANDLING_FEE_RULES } from '@/utils/constants';
import { generateApplicationNo } from '@/utils/format';
import dayjs from 'dayjs';

export interface CustomerNotification {
  id: string;
  customerId: string;
  customerName: string;
  templateName: string;
  templateType: 'refund_confirm' | 'refund_success' | 'refund_reject';
  applicationId?: string;
  applicationNo?: string;
  content: string;
  sentBy: string;
  sentAt: string;
  channel: '短信' | '站内信' | '邮件';
}

interface PersistedState {
  applications: RefundApplication[];
  auditLogs: AuditLog[];
  handlingFeeRules: HandlingFeeRule[];
  customerNotifications: CustomerNotification[];
  lastPersistAt: string;
}

const LS_KEY = 'medical_refund_workbench_v1';

const loadPersistedState = (): Partial<PersistedState> => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      applications: parsed.applications || undefined,
      auditLogs: parsed.auditLogs || undefined,
      handlingFeeRules: parsed.handlingFeeRules || undefined,
      customerNotifications: parsed.customerNotifications || undefined,
    };
  } catch {
    return {};
  }
};

const persisted = loadPersistedState();

interface AppState {
  currentUser: User;
  applications: RefundApplication[];
  applicationsFilter: ApplicationsFilter;
  selectedApplication: RefundApplication | null;
  customers: Customer[];
  originalOrders: OriginalOrder[];
  stores: Store[];
  auditLogs: AuditLog[];
  handlingFeeRules: HandlingFeeRule[];
  defaultHandlingFeeRules: HandlingFeeRule[];
  customerNotifications: CustomerNotification[];
  reportData: ReportData;
  notifications: { id: string; type: 'info' | 'success' | 'warning' | 'error'; message: string }[];

  setFilter: (filter: Partial<ApplicationsFilter>) => void;
  resetFilter: () => void;
  getFilteredApplications: () => RefundApplication[];
  getApplicationById: (id: string) => RefundApplication | undefined;
  selectApplication: (app: RefundApplication | null) => void;

  createApplication: (data: Partial<RefundApplication>) => RefundApplication;
  updateApplication: (id: string, data: Partial<RefundApplication>, reason?: string) => void;
  submitForReview: (id: string) => void;
  approveNode: (id: string, nodeIndex: number, opinion: string) => void;
  rejectNode: (id: string, nodeIndex: number, opinion: string) => void;
  registerRefund: (id: string, method: RefundMethod, relatedOrderId?: string) => void;

  getOrdersByCustomerId: (customerId: string) => OriginalOrder[];
  getApplicationsByCustomerId: (customerId: string) => RefundApplication[];
  getPendingApprovals: () => RefundApplication[];
  getProcessedApprovals: () => RefundApplication[];

  addAuditLog: (action: AuditLog['action'], targetType: AuditLog['targetType'], targetId: string, detail: string, stateChange?: AuditLogStateChange) => void;

  saveHandlingFeeRules: (rules: HandlingFeeRule[]) => void;
  resetHandlingFeeRules: () => void;

  sendCustomerNotification: (params: {
    customerId: string;
    templateType: CustomerNotification['templateType'];
    applicationId?: string;
    channel?: CustomerNotification['channel'];
  }) => CustomerNotification | null;
  getNotificationsByCustomerId: (customerId: string) => CustomerNotification[];

  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  removeNotification: (id: string) => void;

  persist: () => void;
}

const statusFlowMap: Record<number, ApplicationStatus> = {
  0: '草稿',
  1: '待财务复核',
  2: '待店长审批',
  3: '待到账登记',
  4: '已完成',
};

const rejectStatusMap: Record<number, ApplicationStatus> = {
  1: '财务退回',
  2: '店长驳回',
};

const templateMap: Record<CustomerNotification['templateType'], { name: string; build: (app: RefundApplication | undefined, channel: CustomerNotification['channel']) => string }> = {
  refund_confirm: {
    name: '退款确认单',
    build: (app, channel) => {
      if (!app) return channel === '短信'
        ? '【退款确认】您好，您的退款申请已提交，请核对明细。'
        : '您好，您的退款申请已提交，请核对明细。';
      const base = `尊敬的${app.customer.name}您好，您的退款申请${app.applicationNo}已提交，预计实退金额¥${app.finalRefund.toFixed(2)}（含手续费¥${app.handlingFee.toFixed(2)}）。请核对明细，如有疑问请联系客服。`;
      if (channel === '短信') return `【退款确认】${base}`;
      if (channel === '邮件') return `【医美退款确认单】\n\n${base}\n\n申请单号：${app.applicationNo}\n实退金额：¥${app.finalRefund.toFixed(2)}\n手续费：¥${app.handlingFee.toFixed(2)}\n\n如有疑问请致电 400-XXX-XXXX`;
      return base;
    },
  },
  refund_success: {
    name: '到账提醒',
    build: (app, channel) => {
      if (!app) return channel === '短信'
        ? '【到账提醒】您好，您的退款已处理完成，请注意查收。'
        : '您好，您的退款已处理完成，请注意查收。';
      const base = `${app.customer.name}您好，退款申请${app.applicationNo}已处理完成，款项¥${app.finalRefund.toFixed(2)}已按${app.refundMethod || '原路退回'}方式处理，预计1-7个工作日内到账。`;
      if (channel === '短信') return `【到账提醒】${base}`;
      if (channel === '邮件') return `【医美退款到账提醒】\n\n${base}\n\n申请单号：${app.applicationNo}\n到账金额：¥${app.finalRefund.toFixed(2)}\n退款方式：${app.refundMethod || '原路退回'}\n预计到账：1-7个工作日\n\n如有疑问请致电 400-XXX-XXXX`;
      return base;
    },
  },
  refund_reject: {
    name: '审批退回通知',
    build: (app, channel) => {
      if (!app) return channel === '短信'
        ? '【退款提醒】您好，您的退款申请需要补充信息，门店将尽快联系您。'
        : '您好，您的退款申请需要补充信息，门店将尽快联系您。';
      const base = `${app.customer.name}您好，您的退款申请${app.applicationNo}因信息需要补充，已退回门店处理，门店顾问将在1个工作日内与您联系。`;
      if (channel === '短信') return `【退款提醒】${base}`;
      if (channel === '邮件') return `【医美退款申请退回通知】\n\n${base}\n\n申请单号：${app.applicationNo}\n状态：已退回门店\n预计回复：1个工作日内\n\n如有疑问请致电 400-XXX-XXXX`;
      return base;
    },
  },
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: {
    id: 'u005',
    name: '李会计',
    role: '财务主管',
  },

  applications: persisted.applications || [...mockApplications],
  applicationsFilter: {},
  selectedApplication: null,
  customers: [...mockCustomers],
  originalOrders: [...mockOrders],
  stores: [...mockStores],
  auditLogs: persisted.auditLogs || [...mockAuditLogs],
  handlingFeeRules: persisted.handlingFeeRules || [...DEFAULT_HANDLING_FEE_RULES],
  defaultHandlingFeeRules: [...DEFAULT_HANDLING_FEE_RULES],
  customerNotifications: persisted.customerNotifications || [],
  reportData: mockReportData,
  notifications: [],

  setFilter: (filter) => set({ applicationsFilter: { ...get().applicationsFilter, ...filter } }),
  resetFilter: () => set({ applicationsFilter: {} }),

  getFilteredApplications: () => {
    const { applications, applicationsFilter: f } = get();
    return applications.filter((app) => {
      if (f.storeId && app.storeId !== f.storeId) return false;
      if (f.status && app.status !== f.status) return false;
      if (f.applicantName && !app.applicantName.includes(f.applicantName)) return false;
      if (f.startDate && dayjs(app.createdAt).isBefore(dayjs(f.startDate))) return false;
      if (f.endDate && dayjs(app.createdAt).isAfter(dayjs(f.endDate).endOf('day'))) return false;
      if (f.keyword) {
        const kw = f.keyword.toLowerCase();
        const match =
          app.applicationNo.toLowerCase().includes(kw) ||
          app.customer.name.toLowerCase().includes(kw) ||
          app.customer.phone.includes(kw) ||
          app.originalOrder.orderNo.toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  },

  getApplicationById: (id) => get().applications.find((a) => a.id === id),
  selectApplication: (app) => set({ selectedApplication: app }),

  addAuditLog: (action, targetType, targetId, detail, stateChange) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = get().currentUser;
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      targetType,
      targetId,
      detail,
      createdAt: now,
      ip: '192.168.1.' + (Math.floor(Math.random() * 200) + 1),
      stateChange,
    };
    set({ auditLogs: [log, ...get().auditLogs].slice(0, 2000) });
    get().persist();
  },

  createApplication: (data) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const customer = data.customer || get().customers[0];
    const order = data.originalOrder || get().originalOrders[0];
    const newApp: RefundApplication = {
      id: `a${Date.now()}`,
      applicationNo: generateApplicationNo(),
      customerId: data.customerId || customer.id,
      customer,
      originalOrderId: data.originalOrderId || order.id,
      originalOrder: order,
      storeId: data.storeId || order.storeId || 's001',
      storeName: data.storeName || order.storeName || '北京朝阳旗舰院',
      applicantId: get().currentUser.id,
      applicantName: get().currentUser.name,
      actualRefund: 0,
      cardDeduction: 0,
      giftDeduction: 0,
      debtDeduction: 0,
      handlingFee: 0,
      finalRefund: 0,
      itemSplits: [],
      performanceDeductions: [],
      hasDifference: false,
      status: '草稿',
      currentNode: 0,
      createdAt: now,
      updatedAt: now,
      ...data,
      approvalFlow: (() => {
        return [
          { id: 'n0', nodeIndex: 0, nodeName: '创建申请', approverRole: '前台顾问', approverName: get().currentUser.name, status: 'approved' as const, operatedAt: now },
          { id: 'n1', nodeIndex: 1, nodeName: '财务复核', approverRole: '财务主管', status: 'pending' as const },
          { id: 'n2', nodeIndex: 2, nodeName: '店长审批', approverRole: '门店店长', status: 'pending' as const },
          { id: 'n3', nodeIndex: 3, nodeName: '到账登记', approverRole: '前台顾问', status: 'pending' as const },
          { id: 'n4', nodeIndex: 4, nodeName: '完成归档', approverRole: '系统', status: 'pending' as const },
        ];
      })(),
    };
    set({ applications: [newApp, ...get().applications] });
    get().addAuditLog('创建申请', '申请', newApp.id, `创建退款申请 ${newApp.applicationNo}，客户：${customer.name}，原订单：${order.orderNo}`, {
      statusBefore: undefined,
      statusAfter: '草稿',
      currentNodeBefore: undefined,
      currentNodeAfter: 0,
    });
    get().addNotification('success', `退款申请已创建：${newApp.applicationNo}`);
    get().persist();
    return newApp;
  },

  updateApplication: (id, data, reason) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const app = get().getApplicationById(id);
    const beforeRefund = app?.finalRefund || 0;
    const beforeMethod = app?.refundMethod;
    let detail = `更新申请 ${app?.applicationNo || id} 核算信息`;
    const changes: string[] = [];
    if (data.actualRefund !== undefined) changes.push(`实收退款变更为¥${data.actualRefund.toFixed(2)}`);
    if (data.finalRefund !== undefined) changes.push(`实退金额变更为¥${data.finalRefund.toFixed(2)}`);
    if (data.hasDifference !== undefined) changes.push(data.hasDifference ? '标记拆项差异' : '取消差异标记');
    if (data.differenceReason) changes.push('更新差异原因');
    if (changes.length > 0) detail += `：${changes.join('、')}`;
    if (reason) detail += `（${reason}）`;

    const stateChange: AuditLogStateChange = {
      statusBefore: app?.status,
      statusAfter: app?.status,
      finalRefundBefore: beforeRefund,
      finalRefundAfter: data.finalRefund !== undefined ? data.finalRefund : beforeRefund,
      currentNodeBefore: app?.currentNode,
      currentNodeAfter: app?.currentNode,
    };
    if (data.refundMethod && data.refundMethod !== beforeMethod) {
      stateChange.refundMethodBefore = beforeMethod;
      stateChange.refundMethodAfter = data.refundMethod;
    }

    set({
      applications: get().applications.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: now } : a
      ),
    });
    get().addAuditLog('保存核算', '申请', id, detail, stateChange);
    get().persist();
  },

  submitForReview: (id) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const node = 1;
    const app = get().getApplicationById(id);
    const statusBefore = app?.status;
    const nodeBefore = app?.currentNode;
    set({
      applications: get().applications.map((a) => {
        if (a.id !== id) return a;
        const newFlow = a.approvalFlow.map((n) => {
          if (n.nodeIndex === 0) return { ...n, status: 'approved' as const, operatedAt: now };
          if (n.nodeIndex === node) return { ...n, status: 'pending' as const };
          return n;
        });
        return { ...a, status: statusFlowMap[node], currentNode: node, approvalFlow: newFlow, updatedAt: now };
      }),
    });
    get().addAuditLog('提交审批', '申请', id, `提交申请 ${app?.applicationNo || id} 至财务复核，实退¥${app?.finalRefund.toFixed(2) || '0.00'}`, {
      statusBefore, statusAfter: statusFlowMap[node],
      currentNodeBefore: nodeBefore, currentNodeAfter: node,
      finalRefundBefore: app?.finalRefund, finalRefundAfter: app?.finalRefund,
    });
    get().addNotification('success', '已提交财务复核');
    get().persist();
  },

  approveNode: (id, nodeIndex, opinion) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = get().currentUser;
    const nextNode = nodeIndex + 1;
    const app = get().getApplicationById(id);
    const nodeName = app?.approvalFlow.find(n => n.nodeIndex === nodeIndex)?.nodeName || '未知节点';
    const statusBefore = app?.status;
    const nodeBefore = app?.currentNode;
    const newStatus = nextNode >= 5 ? '已完成' : statusFlowMap[nextNode];
    set({
      applications: get().applications.map((a) => {
        if (a.id !== id) return a;
        const newFlow = a.approvalFlow.map((n) => {
          if (n.nodeIndex === nodeIndex) {
            return { ...n, status: 'approved' as const, opinion, approverId: user.id, approverName: user.name, operatedAt: now };
          }
          if (n.nodeIndex === nextNode) return { ...n, status: 'pending' as const };
          return n;
        });
        const isCompleted = nextNode >= 5;
        return {
          ...a,
          status: isCompleted ? '已完成' : statusFlowMap[nextNode],
          currentNode: nextNode,
          approvalFlow: newFlow,
          updatedAt: now,
          completedAt: isCompleted ? now : undefined,
        };
      }),
    });
    get().addAuditLog('审批通过', '申请', id, `${user.name}(${user.role})${nodeName}通过：${opinion || '同意'}，申请：${app?.applicationNo}`, {
      statusBefore, statusAfter: newStatus,
      currentNodeBefore: nodeBefore, currentNodeAfter: nextNode,
      finalRefundBefore: app?.finalRefund, finalRefundAfter: app?.finalRefund,
    });
    get().addNotification('success', '审批已通过');
    get().persist();
  },

  rejectNode: (id, nodeIndex, opinion) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = get().currentUser;
    const app = get().getApplicationById(id);
    const nodeName = app?.approvalFlow.find(n => n.nodeIndex === nodeIndex)?.nodeName || '未知节点';
    const statusBefore = app?.status;
    const nodeBefore = app?.currentNode;
    const newStatus = rejectStatusMap[nodeIndex] || '财务退回';
    set({
      applications: get().applications.map((a) => {
        if (a.id !== id) return a;
        const newFlow = a.approvalFlow.map((n) => {
          if (n.nodeIndex === nodeIndex) {
            return { ...n, status: 'rejected' as const, opinion, approverId: user.id, approverName: user.name, operatedAt: now };
          }
          return n;
        });
        return { ...a, status: newStatus, currentNode: nodeIndex, approvalFlow: newFlow, updatedAt: now };
      }),
    });
    get().addAuditLog('审批退回', '申请', id, `${user.name}(${user.role})${nodeName}退回：${opinion}，申请：${app?.applicationNo}`, {
      statusBefore, statusAfter: newStatus,
      currentNodeBefore: nodeBefore, currentNodeAfter: nodeIndex,
      finalRefundBefore: app?.finalRefund, finalRefundAfter: app?.finalRefund,
    });
    get().addNotification('warning', '已退回申请');
    get().persist();
  },

  registerRefund: (id, method, relatedOrderId) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const app = get().getApplicationById(id);
    const statusBefore = app?.status;
    const nodeBefore = app?.currentNode;
    const methodBefore = app?.refundMethod;
    set({
      applications: get().applications.map((a) => {
        if (a.id !== id) return a;
        const newFlow = a.approvalFlow.map((n) => {
          if (n.nodeIndex === 3) return { ...n, status: 'approved' as const, approverName: get().currentUser.name, operatedAt: now };
          if (n.nodeIndex === 4) return { ...n, status: 'approved' as const, approverName: '系统', operatedAt: now };
          return n;
        });
        return {
          ...a,
          refundMethod: method,
          relatedNewOrderId: relatedOrderId,
          status: '已完成',
          currentNode: 5,
          approvalFlow: newFlow,
          updatedAt: now,
          completedAt: now,
        };
      }),
    });
    let detail = `登记退款方式：${method}，实退¥${app?.finalRefund.toFixed(2)}`;
    if (relatedOrderId) detail += `，关联新订单：${relatedOrderId}`;
    get().addAuditLog('登记到账', '申请', id, detail + `，申请：${app?.applicationNo}`, {
      statusBefore, statusAfter: '已完成',
      currentNodeBefore: nodeBefore, currentNodeAfter: 5,
      finalRefundBefore: app?.finalRefund, finalRefundAfter: app?.finalRefund,
      refundMethodBefore: methodBefore, refundMethodAfter: method,
    });
    get().addNotification('success', `已登记退款方式：${method}`);
    get().persist();
  },

  getOrdersByCustomerId: (customerId) => get().originalOrders.filter((o) => o.customerId === customerId),
  getApplicationsByCustomerId: (customerId) => get().applications.filter((a) => a.customerId === customerId),

  getPendingApprovals: () => {
    const role = get().currentUser.role;
    return get().applications.filter((a) => {
      if (role === '财务主管') return a.status === '待财务复核';
      if (role === '门店店长') return a.status === '待店长审批' && a.storeId === get().currentUser.storeId;
      if (role === '前台顾问') return a.status === '待到账登记';
      return false;
    });
  },

  getProcessedApprovals: () => {
    const role = get().currentUser.role;
    return get().applications.filter((a) => {
      if (role === '财务主管') return ['财务退回', '待店长审批', '待到账登记', '已完成'].includes(a.status);
      if (role === '门店店长') return ['店长驳回', '待到账登记', '已完成'].includes(a.status);
      return a.status === '已完成';
    });
  },

  saveHandlingFeeRules: (rules) => {
    const oldRules = get().handlingFeeRules;
    const changes: string[] = [];
    rules.forEach((r, idx) => {
      const old = oldRules[idx];
      if (!old) return;
      if (Math.abs(old.feeRate - r.feeRate) > 0.00001) {
        changes.push(`${r.paymentMethod}费率 ${(old.feeRate * 100).toFixed(2)}% → ${(r.feeRate * 100).toFixed(2)}%`);
      }
      if (old.minFee !== r.minFee) changes.push(`${r.paymentMethod}最低手续费 ¥${old.minFee} → ¥${r.minFee}`);
      if ((old.maxFee || 0) !== (r.maxFee || 0)) {
        changes.push(`${r.paymentMethod}最高手续费 ¥${old.maxFee || '不限'} → ¥${r.maxFee || '不限'}`);
      }
    });
    set({ handlingFeeRules: rules.map(r => ({ ...r })) });
    get().addAuditLog('修改配置', '手续费规则', 'fee_rules', changes.length > 0 ? changes.join('；') : '保存手续费规则配置');
    get().addNotification('success', '手续费规则已保存，新建申请立即生效');
    get().persist();
  },

  resetHandlingFeeRules: () => {
    set({ handlingFeeRules: [...DEFAULT_HANDLING_FEE_RULES] });
    get().addAuditLog('修改配置', '手续费规则', 'fee_rules', '手续费规则已重置为系统默认值');
    get().addNotification('info', '手续费规则已恢复默认');
    get().persist();
  },

  sendCustomerNotification: ({ customerId, templateType, applicationId, channel = '短信' }) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) {
      get().addNotification('error', '未找到客户信息');
      return null;
    }
    if (!applicationId) {
      get().addNotification('error', '请先选择要关联的退款申请再发送通知');
      return null;
    }
    const app = applicationId ? get().getApplicationById(applicationId) : undefined;
    if (!app) {
      get().addNotification('error', '关联的退款申请不存在');
      return null;
    }
    const template = templateMap[templateType];
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const notif: CustomerNotification = {
      id: `notif_${Date.now()}`,
      customerId,
      customerName: customer.name,
      templateName: template.name,
      templateType,
      applicationId,
      applicationNo: app?.applicationNo,
      content: template.build(app, channel),
      sentBy: get().currentUser.name,
      sentAt: now,
      channel,
    };
    set({ customerNotifications: [notif, ...get().customerNotifications] });
    get().addAuditLog(
      '发送通知',
      '客户通知',
      customerId,
      `向${customer.name}发送${template.name}（${channel}），关联申请${app?.applicationNo}`
    );
    get().addNotification('success', `已发送${template.name}至${customer.name}`);
    get().persist();
    return notif;
  },

  getNotificationsByCustomerId: (customerId) =>
    get().customerNotifications.filter((n) => n.customerId === customerId),

  addNotification: (type, message) => {
    const id = `notif_${Date.now()}`;
    set({ notifications: [...get().notifications, { id, type, message }] });
    setTimeout(() => get().removeNotification(id), 4000);
  },
  removeNotification: (id) => set({ notifications: get().notifications.filter((n) => n.id !== id) }),

  persist: () => {
    try {
      const state: PersistedState = {
        applications: get().applications,
        auditLogs: get().auditLogs,
        handlingFeeRules: get().handlingFeeRules,
        customerNotifications: get().customerNotifications,
        lastPersistAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  },
}));
