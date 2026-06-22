import type { RefundApplication, ApprovalNode, ApplicationStatus } from '@/types';
import { mockCustomers, mockOrders, mockStores } from './base';
import { generateApplicationNo } from '@/utils/format';
import { APPROVAL_FLOW_TEMPLATE } from '@/utils/constants';

const buildApprovalFlow = (status: ApplicationStatus, currentNode: number): ApprovalNode[] => {
  return APPROVAL_FLOW_TEMPLATE.map((tpl, idx) => {
    let nodeStatus: ApprovalNode['status'] = 'pending';
    let approverName: string | undefined;
    let opinion: string | undefined;
    let operatedAt: string | undefined;

    if (idx < currentNode) {
      nodeStatus = 'approved';
      if (idx === 0) { approverName = '前台-张小美'; operatedAt = '2026-06-18 09:30:00'; }
      if (idx === 1) { approverName = '财务-李会计'; opinion = '核算无误'; operatedAt = '2026-06-18 10:15:00'; }
      if (idx === 2) { approverName = '店长-王经理'; opinion = '同意退款'; operatedAt = '2026-06-18 11:00:00'; }
      if (idx === 3) { approverName = '前台-张小美'; opinion = '已原路退回微信'; operatedAt = '2026-06-18 14:00:00'; }
      if (idx === 4) { approverName = '系统'; operatedAt = '2026-06-18 14:05:00'; }
    } else if (idx === currentNode) {
      nodeStatus = 'pending';
    }

    return {
      id: `node_${idx}`,
      nodeIndex: idx,
      nodeName: tpl.nodeName,
      approverRole: tpl.approverRole,
      approverName,
      status: nodeStatus,
      opinion,
      operatedAt,
    };
  });
};

export const mockApplications: RefundApplication[] = [
  {
    id: 'a001',
    applicationNo: 'RF20260618101522A1B2',
    customerId: 'c001',
    customer: mockCustomers[0],
    originalOrderId: 'o001',
    originalOrder: mockOrders[0],
    storeId: 's001',
    storeName: '北京朝阳旗舰院',
    applicantId: 'u001',
    applicantName: '前台-张小美',
    actualRefund: 39500,
    cardDeduction: 3405,
    giftDeduction: 3405,
    debtDeduction: 0,
    handlingFee: 197.5,
    finalRefund: 39302.5,
    itemSplits: [
      { itemId: 'oi001', projectName: '热玛吉五代-面部', refundAmount: 38000, actualPortion: 32441.18, cardPortion: 2794.12, giftPortion: 2794.12, debtPortion: 0 },
      { itemId: 'oi002', projectName: '玻尿酸填充-乔雅登极致', refundAmount: 15000, actualPortion: 12794.12, cardPortion: 1102.94, giftPortion: 1102.94, debtPortion: 0 },
    ],
    performanceDeductions: [
      { id: 'pd001', applicationId: 'a001', role: '医生', personName: '王主任', personId: 'doc001', originalPerformance: 18550, deductionAmount: 13570.43, afterPerformance: 4979.57 },
      { id: 'pd002', applicationId: 'a001', role: '咨询师', personName: '李敏', personId: 'con001', originalPerformance: 7950, deductionAmount: 6785.28, afterPerformance: 1164.72 },
      { id: 'pd003', applicationId: 'a001', role: '渠道', personName: '大众点评', personId: 'ch001', originalPerformance: 3128, deductionAmount: 3618.82, afterPerformance: 0 },
    ],
    hasDifference: false,
    status: '待到账登记',
    currentNode: 3,
    approvalFlow: buildApprovalFlow('待到账登记', 3),
    createdAt: '2026-06-18 09:30:00',
    updatedAt: '2026-06-18 11:00:00',
  },
  {
    id: 'a002',
    applicationNo: 'RF20260619142033C3D4',
    customerId: 'c002',
    customer: mockCustomers[1],
    originalOrderId: 'o002',
    originalOrder: mockOrders[1],
    storeId: 's002',
    storeName: '上海徐汇中心院',
    applicantId: 'u002',
    applicantName: '前台-陈小丽',
    actualRefund: 24500,
    cardDeduction: 1750,
    giftDeduction: 1750,
    debtDeduction: 0,
    handlingFee: 147,
    finalRefund: 24353,
    itemSplits: [
      { itemId: 'oi004', projectName: '超声炮全面部', refundAmount: 28000, actualPortion: 24500, cardPortion: 1750, giftPortion: 1750, debtPortion: 0 },
    ],
    performanceDeductions: [
      { id: 'pd004', applicationId: 'a002', role: '医生', personName: '陈院长', personId: 'doc002', originalPerformance: 9800, deductionAmount: 8575, afterPerformance: 1225 },
      { id: 'pd005', applicationId: 'a002', role: '咨询师', personName: '王芳', personId: 'con002', originalPerformance: 5040, deductionAmount: 4410, afterPerformance: 630 },
    ],
    refundMethod: '原路退回',
    hasDifference: false,
    status: '已完成',
    currentNode: 5,
    approvalFlow: buildApprovalFlow('已完成', 5),
    createdAt: '2026-06-19 14:20:00',
    updatedAt: '2026-06-19 17:30:00',
    completedAt: '2026-06-19 17:30:00',
  },
  {
    id: 'a003',
    applicationNo: 'RF200620093011E5F6',
    customerId: 'c004',
    customer: mockCustomers[3],
    originalOrderId: 'o003',
    originalOrder: mockOrders[2],
    storeId: 's001',
    storeName: '北京朝阳旗舰院',
    applicantId: 'u001',
    applicantName: '前台-张小美',
    actualRefund: 78125,
    cardDeduction: 11718.75,
    giftDeduction: 6250,
    debtDeduction: 3906.25,
    handlingFee: 390.63,
    finalRefund: 77734.37,
    itemSplits: [
      { itemId: 'oi006', projectName: '拉皮手术-中面部提升', refundAmount: 68000, actualPortion: 53125, cardPortion: 7968.75, giftPortion: 4250, debtPortion: 2656.25 },
      { itemId: 'oi008', projectName: '面部吸脂', refundAmount: 28000, actualPortion: 21875, cardPortion: 3281.25, giftPortion: 1750, debtPortion: 1093.75 },
    ],
    performanceDeductions: [
      { id: 'pd006', applicationId: 'a003', role: '医生', personName: '李院长', personId: 'doc003', originalPerformance: 28560, deductionAmount: 28875, afterPerformance: 0 },
      { id: 'pd007', applicationId: 'a003', role: '医生', personName: '王主任', personId: 'doc001', originalPerformance: 9800, deductionAmount: 7656.25, afterPerformance: 2143.75 },
      { id: 'pd008', applicationId: 'a003', role: '咨询师', personName: '赵雯', personId: 'con003', originalPerformance: 19200, deductionAmount: 11250, afterPerformance: 7950 },
    ],
    hasDifference: true,
    differenceReason: '客户只做拉皮和眼袋，未做面部吸脂，但套餐未拆项时吸脂已计入，需要单独扣除。套餐原价128000，拆项总价128000一致，但客户实际未消费吸脂部分。',
    status: '待财务复核',
    currentNode: 1,
    approvalFlow: buildApprovalFlow('待财务复核', 1),
    createdAt: '2026-06-20 09:30:00',
    updatedAt: '2026-06-20 09:30:00',
  },
  {
    id: 'a004',
    applicationNo: 'RF20260620145022G7H8',
    customerId: 'c006',
    customer: mockCustomers[5],
    originalOrderId: 'o004',
    originalOrder: mockOrders[3],
    storeId: 's004',
    storeName: '深圳南山精品院',
    applicantId: 'u003',
    applicantName: '前台-黄小珊',
    actualRefund: 33035.71,
    cardDeduction: 0,
    giftDeduction: 3964.29,
    debtDeduction: 0,
    handlingFee: 198.21,
    finalRefund: 32837.5,
    itemSplits: [
      { itemId: 'oi010', projectName: 'Fotona 4D Pro', refundAmount: 50000, actualPortion: 44642.86, cardPortion: 0, giftPortion: 5357.14, debtPortion: 0 },
    ],
    performanceDeductions: [
      { id: 'pd009', applicationId: 'a004', role: '医生', personName: '黄主任', personId: 'doc004', originalPerformance: 22500, deductionAmount: 13392.86, afterPerformance: 9107.14 },
      { id: 'pd010', applicationId: 'a004', role: '咨询师', personName: '林娜', personId: 'con004', originalPerformance: 12000, deductionAmount: 7142.86, afterPerformance: 4857.14 },
      { id: 'pd011', applicationId: 'a004', role: '渠道', personName: '小红书', personId: 'ch002', originalPerformance: 7500, deductionAmount: 4464.29, afterPerformance: 3035.71 },
    ],
    hasDifference: false,
    status: '待店长审批',
    currentNode: 2,
    approvalFlow: buildApprovalFlow('待店长审批', 2),
    createdAt: '2026-06-20 14:50:00',
    updatedAt: '2026-06-20 15:40:00',
  },
  {
    id: 'a005',
    applicationNo: 'RF20260621101511I9J0',
    customerId: 'c008',
    customer: mockCustomers[7],
    originalOrderId: 'o005',
    originalOrder: mockOrders[4],
    storeId: 's003',
    storeName: '广州天河分院',
    applicantId: 'u004',
    applicantName: '前台-吴小悦',
    actualRefund: 12500,
    cardDeduction: 2500,
    giftDeduction: 0,
    debtDeduction: 0,
    handlingFee: 0,
    finalRefund: 12500,
    itemSplits: [
      { itemId: 'oi012', projectName: '皮秒祛斑', refundAmount: 18000, actualPortion: 15000, cardPortion: 3000, giftPortion: 0, debtPortion: 0 },
    ],
    performanceDeductions: [
      { id: 'pd012', applicationId: 'a005', role: '医生', personName: '郑院长', personId: 'doc005', originalPerformance: 5760, deductionAmount: 4800, afterPerformance: 960 },
      { id: 'pd013', applicationId: 'a005', role: '咨询师', personName: '何琳', personId: 'con005', originalPerformance: 2520, deductionAmount: 2100, afterPerformance: 420 },
    ],
    remark: '客户怀孕，暂时无法做激光项目，先退掉1次，剩余1次保留。',
    hasDifference: false,
    status: '财务退回',
    currentNode: 1,
    approvalFlow: (() => {
      const flow = buildApprovalFlow('财务退回', 1);
      flow[1].status = 'rejected';
      flow[1].opinion = '申请金额有误，订单显示客户买了2次皮秒，每次是9000，客户做了0次，客户说只退1次但申请金额是按2次，请确认退几次。';
      flow[1].approverName = '财务-李会计';
      flow[1].operatedAt = '2026-06-21 11:20:00';
      return flow;
    })(),
    createdAt: '2026-06-21 10:15:00',
    updatedAt: '2026-06-21 11:20:00',
  },
  {
    id: 'a006',
    applicationNo: generateApplicationNo(),
    customerId: 'c003',
    customer: mockCustomers[2],
    originalOrderId: 'o001',
    originalOrder: mockOrders[0],
    storeId: 's002',
    storeName: '上海徐汇中心院',
    applicantId: 'u002',
    applicantName: '前台-陈小丽',
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
    approvalFlow: buildApprovalFlow('草稿', 0),
    createdAt: '2026-06-22 09:00:00',
    updatedAt: '2026-06-22 09:00:00',
  },
];

export const mockAuditLogs = [
  { id: 'log001', userId: 'u001', userName: '张小美', userRole: '前台顾问', action: '创建申请', targetType: '申请', targetId: 'a001', detail: '创建退款申请 RF20260618101522A1B2', createdAt: '2026-06-18 09:30:15', ip: '192.168.1.101' },
  { id: 'log002', userId: 'u001', userName: '张小美', userRole: '前台顾问', action: '提交审批', targetType: '申请', targetId: 'a001', detail: '提交申请至财务复核', createdAt: '2026-06-18 09:45:22', ip: '192.168.1.101' },
  { id: 'log003', userId: 'u005', userName: '李会计', userRole: '财务主管', action: '审批通过', targetType: '申请', targetId: 'a001', detail: '财务复核通过', createdAt: '2026-06-18 10:15:08', ip: '192.168.1.50' },
  { id: 'log004', userId: 'u006', userName: '王经理', userRole: '门店店长', action: '审批通过', targetType: '申请', targetId: 'a001', detail: '店长审批通过', createdAt: '2026-06-18 11:00:33', ip: '192.168.1.100' },
  { id: 'log005', userId: 'u001', userName: '张小美', userRole: '前台顾问', action: '登记到账', targetType: '申请', targetId: 'a002', detail: '登记原路退回微信 ¥24,353', createdAt: '2026-06-19 17:30:00', ip: '192.168.1.101' },
  { id: 'log006', userId: 'u001', userName: '张小美', userRole: '前台顾问', action: '创建申请', targetType: '申请', targetId: 'a003', detail: '创建退款申请含差异标注', createdAt: '2026-06-20 09:30:00', ip: '192.168.1.101' },
  { id: 'log007', userId: 'u005', userName: '李会计', userRole: '财务主管', action: '审批退回', targetType: '申请', targetId: 'a005', detail: '财务退回，请确认退项次数', createdAt: '2026-06-21 11:20:00', ip: '192.168.1.50' },
  { id: 'log008', userId: 'u005', userName: '李会计', userRole: '财务主管', action: '修改配置', targetType: '手续费规则', targetId: 'rule_wechat', detail: '微信手续费率从 0.6% 调整为 0.55%', createdAt: '2026-06-15 16:00:00', ip: '192.168.1.50' },
  { id: 'log009', userId: 'u006', userName: '王经理', userRole: '门店店长', action: '登录系统', targetType: '会话', targetId: '-', detail: '用户登录', createdAt: '2026-06-22 08:30:00', ip: '192.168.1.100' },
  { id: 'log010', userId: 'u003', userName: '黄小珊', userRole: '前台顾问', action: '创建申请', targetType: '申请', targetId: 'a004', detail: '创建深圳南山店退款申请', createdAt: '2026-06-20 14:50:00', ip: '192.168.2.101' },
];
