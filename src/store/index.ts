import { create } from 'zustand';
import type {
  RefundApplication, ApplicationsFilter, Customer, OriginalOrder,
  Store, User, AuditLog, HandlingFeeRule, ReportData, ApplicationStatus,
  RefundMethod,
} from '@/types';
import { mockApplications, mockAuditLogs } from '@/mock/data/applications';
import { mockCustomers, mockOrders, mockStores } from '@/mock/data/base';
import { mockReportData } from '@/mock/data/reports';
import { DEFAULT_HANDLING_FEE_RULES } from '@/utils/constants';
import { generateApplicationNo } from '@/utils/format';
import dayjs from 'dayjs';

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
  reportData: ReportData;
  notifications: { id: string; type: 'info' | 'success' | 'warning' | 'error'; message: string }[];

  setFilter: (filter: Partial<ApplicationsFilter>) => void;
  resetFilter: () => void;
  getFilteredApplications: () => RefundApplication[];
  getApplicationById: (id: string) => RefundApplication | undefined;
  selectApplication: (app: RefundApplication | null) => void;

  createApplication: (data: Partial<RefundApplication>) => RefundApplication;
  updateApplication: (id: string, data: Partial<RefundApplication>) => void;
  submitForReview: (id: string) => void;
  approveNode: (id: string, nodeIndex: number, opinion: string) => void;
  rejectNode: (id: string, nodeIndex: number, opinion: string) => void;
  registerRefund: (id: string, method: RefundMethod, relatedOrderId?: string) => void;

  getOrdersByCustomerId: (customerId: string) => OriginalOrder[];
  getApplicationsByCustomerId: (customerId: string) => RefundApplication[];
  getPendingApprovals: () => RefundApplication[];
  getProcessedApprovals: () => RefundApplication[];

  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
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

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: {
    id: 'u005',
    name: '李会计',
    role: '财务主管',
  },

  applications: [...mockApplications],
  applicationsFilter: {},
  selectedApplication: null,
  customers: [...mockCustomers],
  originalOrders: [...mockOrders],
  stores: [...mockStores],
  auditLogs: [...mockAuditLogs],
  handlingFeeRules: [...DEFAULT_HANDLING_FEE_RULES],
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

  createApplication: (data) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const newApp: RefundApplication = {
      id: `a${Date.now()}`,
      applicationNo: generateApplicationNo(),
      customerId: data.customerId || '',
      customer: data.customer || get().customers[0],
      originalOrderId: data.originalOrderId || '',
      originalOrder: data.originalOrder || get().originalOrders[0],
      storeId: data.storeId || 's001',
      storeName: data.storeName || '北京朝阳旗舰院',
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
        const flow = DEFAULT_HANDLING_FEE_RULES ? [] : [];
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
    get().addNotification('success', `退款申请已创建：${newApp.applicationNo}`);
    return newApp;
  },

  updateApplication: (id, data) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    set({
      applications: get().applications.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: now } : a
      ),
    });
  },

  submitForReview: (id) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const node = 1;
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
    get().addNotification('success', '已提交财务复核');
  },

  approveNode: (id, nodeIndex, opinion) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = get().currentUser;
    const nextNode = nodeIndex + 1;
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
    get().addNotification('success', '审批已通过');
  },

  rejectNode: (id, nodeIndex, opinion) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const user = get().currentUser;
    set({
      applications: get().applications.map((a) => {
        if (a.id !== id) return a;
        const newFlow = a.approvalFlow.map((n) => {
          if (n.nodeIndex === nodeIndex) {
            return { ...n, status: 'rejected' as const, opinion, approverId: user.id, approverName: user.name, operatedAt: now };
          }
          return n;
        });
        return { ...a, status: rejectStatusMap[nodeIndex] || '财务退回', currentNode: nodeIndex, approvalFlow: newFlow, updatedAt: now };
      }),
    });
    get().addNotification('warning', '已退回申请');
  },

  registerRefund: (id, method, relatedOrderId) => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
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
    get().addNotification('success', `已登记退款方式：${method}`);
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

  addNotification: (type, message) => {
    const id = `notif_${Date.now()}`;
    set({ notifications: [...get().notifications, { id, type, message }] });
    setTimeout(() => get().removeNotification(id), 4000);
  },
  removeNotification: (id) => set({ notifications: get().notifications.filter((n) => n.id !== id) }),
}));
