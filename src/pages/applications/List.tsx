import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, TrendingUp, AlertTriangle, Plus, Filter,
  Search, ChevronDown, ChevronRight, Eye, Printer, X, Calendar,
  Building2, UserCheck, Download,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/business/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import RefundVoucher from '@/components/business/RefundVoucher';
import { formatCurrency, formatDateTime, formatPhone } from '@/utils/format';
import type { ApplicationStatus } from '@/types';
import dayjs from 'dayjs';
import clsx from 'clsx';

const statusOptions: (ApplicationStatus | '全部')[] = [
  '全部', '草稿', '待财务复核', '财务退回', '待店长审批', '店长驳回', '待到账登记', '已完成', '已取消',
];

const ApplicationList = () => {
  const navigate = useNavigate();
  const {
    stores, applicationsFilter, setFilter, resetFilter,
    getFilteredApplications,
  } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherAppId, setVoucherAppId] = useState<string | null>(null);

  const filtered = useMemo(() => getFilteredApplications(), [applicationsFilter]);
  const voucherApp = voucherAppId ? filtered.find(a => a.id === voucherAppId) : null;

  const pendingCount = filtered.filter((a) => a.status === '待财务复核' || a.status === '待店长审批').length;
  const todayAmount = filtered
    .filter((a) => dayjs(a.createdAt).isSame(dayjs(), 'day'))
    .reduce((s, a) => s + a.finalRefund, 0);
  const monthAmount = filtered
    .filter((a) => dayjs(a.createdAt).isSame(dayjs(), 'month'))
    .reduce((s, a) => s + a.finalRefund, 0);
  const diffCount = filtered.filter((a) => a.hasDifference).length;

  const handleRowClick = (id: string) => {
    setSelectedAppId(id);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/applications/${id}`);
  };

  const selectedApp = filtered.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="待审批申请"
          value={pendingCount.toString()}
          icon={Clock}
          trend={8.2}
          trendLabel="较上周"
          color="warning"
          subtitle="财务复核 + 店长审批"
        />
        <StatCard
          title="今日退款额"
          value={formatCurrency(todayAmount)}
          icon={FileText}
          trend={12.5}
          trendLabel="较昨日"
          color="primary"
          subtitle="实退金额合计"
        />
        <StatCard
          title="本月累计退款"
          value={formatCurrency(monthAmount)}
          icon={TrendingUp}
          trend={-5.3}
          trendLabel="同比上月"
          color="success"
          subtitle={`1月 - ${dayjs().date()}日`}
        />
        <StatCard
          title="异常单数"
          value={diffCount.toString()}
          icon={AlertTriangle}
          trend={0}
          color="danger"
          subtitle="含拆项差异，需重点复核"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">退款申请列表</h2>
            <p className="text-xs text-neutral-500 mt-0.5">共 {filtered.length} 条申请记录</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'btn-secondary',
                showFilters && '!bg-primary-50 !border-primary-300 !text-primary-700',
              )}
            >
              <Filter className="w-4 h-4" />
              筛选
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showFilters && 'rotate-180')} />
            </button>
            <button onClick={() => navigate('/applications/new')} className="btn-primary">
              <Plus className="w-4 h-4" />
              新建退款申请
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-200 grid grid-cols-5 gap-3 animate-fade-in">
            <div>
              <label className="label">所属门店</label>
              <select
                value={applicationsFilter.storeId || ''}
                onChange={(e) => setFilter({ storeId: e.target.value || undefined })}
                className="input input-sm"
              >
                <option value="">全部门店</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">申请状态</label>
              <select
                value={applicationsFilter.status || '全部'}
                onChange={(e) => setFilter({ status: e.target.value === '全部' ? undefined : e.target.value as ApplicationStatus })}
                className="input input-sm"
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">申请开始日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="date"
                  value={applicationsFilter.startDate || ''}
                  onChange={(e) => setFilter({ startDate: e.target.value || undefined })}
                  className="input input-sm pl-8"
                />
              </div>
            </div>
            <div>
              <label className="label">申请结束日期</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="date"
                  value={applicationsFilter.endDate || ''}
                  onChange={(e) => setFilter({ endDate: e.target.value || undefined })}
                  className="input input-sm pl-8"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={resetFilter} className="btn-ghost flex-1">
                <X className="w-3.5 h-3.5" /> 重置
              </button>
            </div>
          </div>
        )}

        <div className="relative flex gap-4">
          <div className={clsx('transition-all duration-300', selectedApp ? 'w-[calc(100%-400px)]' : 'w-full')}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>申请单号</th>
                    <th>客户信息</th>
                    <th>所属门店</th>
                    <th>原订单号</th>
                    <th className="text-right">实退金额</th>
                    <th>申请人</th>
                    <th>申请时间</th>
                    <th>状态</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-10 h-10 opacity-40" />
                          <p>暂无匹配的申请记录</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => handleRowClick(app.id)}
                        className={clsx('cursor-pointer', selectedAppId === app.id && 'table-row-active')}
                      >
                        <td className="font-mono text-xs text-primary-700 font-semibold">{app.applicationNo}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <CustomerInfoCard customer={app.customer} compact />
                          </div>
                        </td>
                        <td className="text-xs">
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                            {app.storeName}
                          </div>
                        </td>
                        <td className="font-mono text-xs text-neutral-600">{app.originalOrder.orderNo}</td>
                        <td className="text-right amount-lg text-danger-700 font-semibold">{formatCurrency(app.finalRefund)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-700">{app.applicantName}</span>
                          </div>
                        </td>
                        <td className="text-xs text-neutral-500">{formatDateTime(app.createdAt)}</td>
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={app.status} />
                            {app.hasDifference && (
                              <span className="text-danger-500" title="存在拆项差异">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleViewDetail(app.id); }}
                              className="btn-ghost !px-2 !py-1"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setVoucherAppId(app.id); setShowVoucher(true); }}
                              className="btn-ghost !px-2 !py-1"
                              title="打印/导出退款确认单"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedApp && (
            <div className="w-[380px] bg-white rounded-lg border border-neutral-200 shadow-card overflow-hidden flex-shrink-0 animate-slide-up">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-white/70 font-medium uppercase tracking-wide">申请单号</p>
                    <p className="font-mono text-sm font-bold">{selectedApp.applicationNo}</p>
                  </div>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <p className="text-[11px] text-white/60">{formatDateTime(selectedApp.createdAt)} · {selectedApp.applicantName}</p>
              </div>

              <div className="p-4 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
                <CustomerInfoCard customer={selectedApp.customer} compact />

                <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">所属门店</span>
                    <span className="text-neutral-800 font-medium">{selectedApp.storeName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">原订单号</span>
                    <span className="font-mono text-neutral-800">{selectedApp.originalOrder.orderNo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">支付方式</span>
                    <span className="text-neutral-800">{selectedApp.originalOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary-50 p-3">
                    <p className="text-[11px] text-primary-600 mb-1">退项项目</p>
                    <p className="text-lg font-bold text-primary-800">{selectedApp.itemSplits.length} 项</p>
                  </div>
                  <div className="rounded-lg bg-warning-50 p-3">
                    <p className="text-[11px] text-warning-600 mb-1">业绩冲减</p>
                    <p className="text-lg font-bold text-warning-800">{selectedApp.performanceDeductions.length} 人</p>
                  </div>
                </div>

                <div className="border-t-2 border-primary-200 pt-4">
                  <p className="text-xs text-neutral-500 mb-1 text-center">最终实退金额</p>
                  <p className="text-2xl font-bold font-mono text-center text-danger-700">{formatCurrency(selectedApp.finalRefund)}</p>
                  <p className="text-[10px] text-neutral-400 text-center mt-1">
                    含手续费 {formatCurrency(selectedApp.handlingFee)}
                  </p>
                </div>

                {selectedApp.hasDifference && (
                  <div className="rounded-lg bg-danger-50 border border-danger-200 p-3 text-xs text-danger-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">套餐拆项差异</p>
                      <p className="text-danger-600 leading-relaxed">{selectedApp.differenceReason?.slice(0, 50)}...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setVoucherAppId(selectedApp.id); setShowVoucher(true); }}
                    className="btn-secondary !py-2 text-sm"
                  >
                    <Printer className="w-3.5 h-3.5" /> 打印
                  </button>
                  <button
                    onClick={() => { setVoucherAppId(selectedApp.id); setShowVoucher(true); }}
                    className="btn-secondary !py-2 text-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> 导出
                  </button>
                </div>
                <button onClick={() => handleViewDetail(selectedApp.id)} className="btn-primary w-full">
                  <Eye className="w-4 h-4" />
                  查看完整核算详情
                  <ChevronRight className="w-4 h-4 -mr-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showVoucher && voucherApp && (
        <RefundVoucher
          application={voucherApp}
          mode="preview"
          onClose={() => { setShowVoucher(false); setVoucherAppId(null); }}
        />
      )}
    </div>
  );
};

export default ApplicationList;
