import type { Store, Customer, OriginalOrder } from '@/types';

export const mockStores: Store[] = [
  { id: 's001', name: '北京朝阳旗舰院', city: '北京', managerName: '张建华', phone: '13800138001' },
  { id: 's002', name: '上海徐汇中心院', city: '上海', managerName: '李明远', phone: '13800138002' },
  { id: 's003', name: '广州天河分院', city: '广州', managerName: '王晓梅', phone: '13800138003' },
  { id: 's004', name: '深圳南山精品院', city: '深圳', managerName: '陈志刚', phone: '13800138004' },
  { id: 's005', name: '成都高新分院', city: '成都', managerName: '刘思琪', phone: '13800138005' },
];

export const mockCustomers: Customer[] = [
  {
    id: 'c001', name: '王梦琪', phone: '13912345678', memberLevel: '钻石',
    totalSpent: 586000, refundCount: 2, createdAt: '2023-03-15 10:30:00',
  },
  {
    id: 'c002', name: '李思雨', phone: '13987654321', memberLevel: '金卡',
    totalSpent: 186000, refundCount: 1, createdAt: '2023-06-20 14:20:00',
  },
  {
    id: 'c003', name: '张雨涵', phone: '13611112222', memberLevel: '银卡',
    totalSpent: 68000, refundCount: 0, createdAt: '2024-01-08 09:15:00',
  },
  {
    id: 'c004', name: '刘雨彤', phone: '13833334444', memberLevel: '金卡',
    totalSpent: 256000, refundCount: 3, createdAt: '2023-08-12 16:45:00',
  },
  {
    id: 'c005', name: '陈雪梅', phone: '13755556666', memberLevel: '普通',
    totalSpent: 18500, refundCount: 0, createdAt: '2024-03-22 11:30:00',
  },
  {
    id: 'c006', name: '赵婷婷', phone: '13577778888', memberLevel: '钻石',
    totalSpent: 892000, refundCount: 4, createdAt: '2022-11-30 13:00:00',
  },
  {
    id: 'c007', name: '孙雅婷', phone: '13499990000', memberLevel: '银卡',
    totalSpent: 52000, refundCount: 1, createdAt: '2024-02-14 10:00:00',
  },
  {
    id: 'c008', name: '周晓燕', phone: '13312121313', memberLevel: '金卡',
    totalSpent: 198000, refundCount: 2, createdAt: '2023-09-05 15:20:00',
  },
];

const buildOrder = (
  id: string, orderNo: string, customerId: string, storeId: string, storeName: string,
  totalAmount: number, actualAmount: number, cardDeduction: number, giftAmount: number,
  debtAmount: number, paymentMethod: OriginalOrder['paymentMethod'], createdAt: string,
  items: OriginalOrder['items'], consultantName: string
): OriginalOrder => ({
  id, orderNo, customerId, storeId, storeName,
  totalAmount, actualAmount, cardDeduction, giftAmount, debtAmount,
  paymentMethod, createdAt, items, consultantName,
});

export const mockOrders: OriginalOrder[] = [
  buildOrder('o001', 'OR202605280001', 'c001', 's001', '北京朝阳旗舰院',
    68000, 58000, 5000, 5000, 0, '银行卡', '2026-05-28 10:30:00',
    [
      { id: 'oi001', orderId: 'o001', projectName: '热玛吉五代-面部', unitPrice: 38000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'normal', doctorName: '王主任', consultantName: '李敏', channelName: '大众点评', doctorRatio: 0.35, consultantRatio: 0.15, channelRatio: 0.08 },
      { id: 'oi002', orderId: 'o001', projectName: '玻尿酸填充-乔雅登极致', unitPrice: 15000, totalCount: 2, usedCount: 1, remainingCount: 1, refundCount: 0, type: 'normal', doctorName: '王主任', consultantName: '李敏', channelName: '大众点评', doctorRatio: 0.3, consultantRatio: 0.15, channelRatio: 0.08 },
      { id: 'oi003', orderId: 'o001', projectName: '水光针-基础补水', unitPrice: 2500, totalCount: 5, usedCount: 2, remainingCount: 3, refundCount: 0, type: 'gift', doctorName: '张医生', consultantName: '李敏', doctorRatio: 0.2, consultantRatio: 0.1 },
    ],
    '李敏'
  ),
  buildOrder('o002', 'OR202606010002', 'c002', 's002', '上海徐汇中心院',
    32000, 28000, 2000, 2000, 0, '微信', '2026-06-01 14:20:00',
    [
      { id: 'oi004', orderId: 'o002', projectName: '超声炮全面部', unitPrice: 28000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'normal', doctorName: '陈院长', consultantName: '王芳', doctorRatio: 0.35, consultantRatio: 0.18 },
      { id: 'oi005', orderId: 'o002', projectName: '光子嫩肤M22', unitPrice: 2000, totalCount: 2, usedCount: 0, remainingCount: 2, refundCount: 0, type: 'gift', doctorName: '刘医生', consultantName: '王芳', doctorRatio: 0.2, consultantRatio: 0.1 },
    ],
    '王芳'
  ),
  buildOrder('o003', 'OR202606050003', 'c004', 's001', '北京朝阳旗舰院',
    128000, 100000, 15000, 8000, 5000, '银行卡', '2026-06-05 09:15:00',
    [
      { id: 'oi006', orderId: 'o003', projectName: '拉皮手术-中面部提升', unitPrice: 68000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'normal', packageId: 'pkg001', doctorName: '李院长', consultantName: '赵雯', doctorRatio: 0.4, consultantRatio: 0.15 },
      { id: 'oi007', orderId: 'o003', projectName: '眼袋祛除术', unitPrice: 32000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'normal', packageId: 'pkg001', doctorName: '李院长', consultantName: '赵雯', doctorRatio: 0.35, consultantRatio: 0.15 },
      { id: 'oi008', orderId: 'o003', projectName: '面部吸脂', unitPrice: 28000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'normal', packageId: 'pkg001', doctorName: '王主任', consultantName: '赵雯', doctorRatio: 0.35, consultantRatio: 0.15 },
      { id: 'oi009', orderId: 'o003', projectName: '抗衰套餐-手术包', unitPrice: 128000, totalCount: 1, usedCount: 0, remainingCount: 1, refundCount: 0, type: 'package', doctorName: '李院长', consultantName: '赵雯', doctorRatio: 0.38, consultantRatio: 0.15 },
    ],
    '赵雯'
  ),
  buildOrder('o004', 'OR202606100004', 'c006', 's004', '深圳南山精品院',
    56000, 50000, 0, 6000, 0, '支付宝', '2026-06-10 16:00:00',
    [
      { id: 'oi010', orderId: 'o004', projectName: 'Fotona 4D Pro', unitPrice: 25000, totalCount: 3, usedCount: 1, remainingCount: 2, refundCount: 0, type: 'normal', doctorName: '黄主任', consultantName: '林娜', channelName: '小红书', doctorRatio: 0.3, consultantRatio: 0.16, channelRatio: 0.1 },
      { id: 'oi011', orderId: 'o004', projectName: '射频紧肤', unitPrice: 3000, totalCount: 5, usedCount: 0, remainingCount: 5, refundCount: 0, type: 'gift', doctorName: '周医生', consultantName: '林娜', doctorRatio: 0.18, consultantRatio: 0.1 },
    ],
    '林娜'
  ),
  buildOrder('o005', 'OR202606120005', 'c008', 's003', '广州天河分院',
    18000, 15000, 3000, 0, 0, '储值卡', '2026-06-12 11:30:00',
    [
      { id: 'oi012', orderId: 'o005', projectName: '皮秒祛斑', unitPrice: 9000, totalCount: 2, usedCount: 0, remainingCount: 2, refundCount: 0, type: 'normal', doctorName: '郑院长', consultantName: '何琳', doctorRatio: 0.32, consultantRatio: 0.14 },
    ],
    '何琳'
  ),
];
