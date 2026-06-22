import type { ReportData, StoreReportData, ConsultantRanking, TrendData } from '@/types';
import dayjs from 'dayjs';

const storeReports: StoreReportData[] = [
  { storeId: 's001', storeName: '北京朝阳旗舰院', refundCount: 18, refundAmount: 485620, performanceDeduction: 145686, differenceCount: 3 },
  { storeId: 's002', storeName: '上海徐汇中心院', refundCount: 15, refundAmount: 362400, performanceDeduction: 108720, differenceCount: 1 },
  { storeId: 's003', storeName: '广州天河分院', refundCount: 10, refundAmount: 198500, performanceDeduction: 59550, differenceCount: 2 },
  { storeId: 's004', storeName: '深圳南山精品院', refundCount: 12, refundAmount: 256800, performanceDeduction: 77040, differenceCount: 0 },
  { storeId: 's005', storeName: '成都高新分院', refundCount: 7, refundAmount: 112300, performanceDeduction: 33690, differenceCount: 1 },
];

const consultantRankings: ConsultantRanking[] = [
  { rank: 1, consultantName: '李敏', storeName: '北京朝阳旗舰院', refundCount: 8, refundAmount: 156400, performanceDeduction: 46920 },
  { rank: 2, consultantName: '赵雯', storeName: '北京朝阳旗舰院', refundCount: 6, refundAmount: 142500, performanceDeduction: 42750 },
  { rank: 3, consultantName: '王芳', storeName: '上海徐汇中心院', refundCount: 7, refundAmount: 128600, performanceDeduction: 38580 },
  { rank: 4, consultantName: '林娜', storeName: '深圳南山精品院', refundCount: 5, refundAmount: 98700, performanceDeduction: 29610 },
  { rank: 5, consultantName: '何琳', storeName: '广州天河分院', refundCount: 4, refundAmount: 76500, performanceDeduction: 22950 },
  { rank: 6, consultantName: '孙丽', storeName: '上海徐汇中心院', refundCount: 4, refundAmount: 68200, performanceDeduction: 20460 },
  { rank: 7, consultantName: '周洁', storeName: '成都高新分院', refundCount: 3, refundAmount: 52300, performanceDeduction: 15690 },
  { rank: 8, consultantName: '吴静', storeName: '广州天河分院', refundCount: 3, refundAmount: 41200, performanceDeduction: 12360 },
];

const trendData: TrendData[] = (() => {
  const arr: TrendData[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = dayjs().subtract(i, 'day');
    const seed = i * 7 + 3;
    arr.push({
      date: d.format('MM-DD'),
      refundCount: 3 + (seed % 5) + ((i * 3) % 4),
      refundAmount: 45000 + ((seed * 8123) % 80000),
    });
  }
  return arr;
})();

export const mockReportData: ReportData = {
  totalRefundAmount: 1415620,
  totalRefundCount: 62,
  avgRefundAmount: 22832.58,
  totalPerformanceDeduction: 424686,
  differenceCount: 7,
  storeReports,
  consultantRankings,
  trendData,
};
