import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, CheckCircle, XCircle, Filter, Eye,
  AlertTriangle, MessageSquare, ThumbsUp, ThumbsDown, Search,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/ui/StatusBadge';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import ApprovalFlow from '@/components/business/ApprovalFlow';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { ApplicationStatus } from '@/types';
import clsx from 'clsx';

const ApprovalCenter = () => {
  const navigate = useNavigate();
  const { getPendingApprovals, getProcessedApprovals, currentUser, approveNode, rejectNode } = useAppStore();
  const [tab, setTab] = useState<'pending' | 'processed'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opinion, setOpinion] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'approve' | 'reject'; id: string; node: number } | null>(null);

  const pending = getPendingApprovals();
  const processed = getProcessedApprovals();
  const list = tab === 'pending' ? pending : processed;

  const selected = list.find((a) => a.id === selectedId);

  const handleConfirm = () => {
    if (!confirmDialog) return;
    if (confirmDialog.type === 'reject' && !opinion.trim()) {
      alert('请填写退回原因');
      return;
    }
    if (confirmDialog.type === 'approve') {
      approveNode(confirmDialog.id, confirmDialog.node, opinion || '同意');
    } else {
      rejectNode(confirmDialog.id, confirmDialog.node, opinion);
    }
    setConfirmDialog(null);
    setOpinion('');
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card !bg-gradient-to-br !from-warning-50 !to-white border-warning-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warning-700">待我审批</p>
              <p className="text-3xl font-bold mt-2 text-warning-700">{pending.length}</p>
              <p className="text-xs text-neutral-500 mt-1">需要您处理的申请</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center text-warning-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">已处理</p>
              <p className="text-3xl font-bold mt-2 text-neutral-800">{processed.length}</p>
              <p className="text-xs text-neutral-500 mt-1">本月已处理申请</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center text-success-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">待处理金额</p>
              <p className="text-3xl font-bold mt-2 font-mono text-primary-700">
                {formatCurrency(pending.reduce((s, a) => s + a.finalRefund, 0))}
              </p>
              <p className="text-xs text-neutral-500 mt-1">全部待审批申请实退</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">异常单提醒</p>
              <p className="text-3xl font-bold mt-2 text-danger-700">
                {pending.filter((a) => a.hasDifference).length}
              </p>
              <p className="text-xs text-neutral-500 mt-1">含拆项差异，需重点审核</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center text-danger-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {[
              { key: 'pending', label: '待办审批', count: pending.length, icon: Clock },
              { key: 'processed', label: '已办审批', count: processed.length, icon: CheckCircle },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as any)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    active ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <span className={clsx(
                    'min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center',
                    active ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-600',
                  )}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索申请单号、客户..."
              className="input pl-9 input-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-2 space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin pr-2">
            {list.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{tab === 'pending' ? '暂无待处理审批' : '暂无已处理审批'}</p>
              </div>
            ) : (
              list.map((app) => {
                const active = selectedId === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedId(app.id)}
                    className={clsx(
                      'rounded-xl p-4 border-2 cursor-pointer transition-all',
                      active
                        ? 'border-primary-500 bg-primary-50/50 shadow-md'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-primary-700 truncate">{app.applicationNo}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{formatDateTime(app.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={app.status} />
                        {app.hasDifference && <AlertTriangle className="w-4 h-4 text-danger-500" />}
                      </div>
                    </div>

                    <CustomerInfoCard customer={app.customer} compact />

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-neutral-400">实退金额</p>
                        <p className="text-lg font-bold font-mono text-danger-700">{formatCurrency(app.finalRefund)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-neutral-400">当前节点</p>
                        <p className="text-sm font-semibold text-primary-700">
                          {app.approvalFlow[app.currentNode]?.nodeName || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="col-span-3">
            {selected ? (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-bold">{selected.applicationNo}</span>
                        <StatusBadge status={selected.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/70">
                        <span>申请人：{selected.applicantName}</span>
                        <span>门店：{selected.storeName}</span>
                        <span>原订单：{selected.originalOrder.orderNo}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/applications/${selected.id}`)}
                      className="bg-white/15 hover:bg-white/25 transition-colors text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      完整详情
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-white/60">退项项目</p>
                      <p className="text-xl font-bold">{selected.itemSplits.length} 项</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/60">业绩冲减</p>
                      <p className="text-xl font-bold">{selected.performanceDeductions.length} 人</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/60">实收退款</p>
                      <p className="text-xl font-bold font-mono">{formatCurrency(selected.actualRefund)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/60">最终实退</p>
                      <p className="text-xl font-bold font-mono text-warning-300">{formatCurrency(selected.finalRefund)}</p>
                    </div>
                  </div>
                </div>

                <ApprovalFlow nodes={selected.approvalFlow} currentNode={selected.currentNode} />

                {selected.hasDifference && (
                  <div className="rounded-xl p-4 bg-danger-50 border-2 border-dashed border-danger-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-danger-800 mb-1">⚠️ 存在套餐拆项差异</h4>
                        <p className="text-sm text-danger-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-danger-200">
                          {selected.differenceReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      项目核销概览
                    </h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-thin">
                    <table className="table !rounded-none !border-0">
                      <thead className="!bg-transparent">
                        <tr>
                          <th>项目名称</th>
                          <th className="text-center">退项次数</th>
                          <th className="text-right">退项金额</th>
                          <th className="text-right">实收部分</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {selected.itemSplits.map((s) => (
                          <tr key={s.itemId}>
                            <td className="text-sm">{s.projectName}</td>
                            <td className="text-center font-semibold text-danger-700">
                              {selected.originalOrder.items.find((i) => i.id === s.itemId)?.refundCount || '?'} 次
                            </td>
                            <td className="text-right amount font-semibold text-neutral-800">{formatCurrency(s.refundAmount)}</td>
                            <td className="text-right amount text-primary-700">{formatCurrency(s.actualPortion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {tab === 'pending' && (
                  <div className="rounded-xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 p-5">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                      {currentUser.role}审批操作
                    </h4>
                    <label className="label text-xs">
                      {currentUser.role === '财务主管' ? '财务复核意见' : '店长审批意见'}
                      <span className="text-neutral-400 ml-1 font-normal">（退回必填）</span>
                    </label>
                    <textarea
                      value={opinion}
                      onChange={(e) => setOpinion(e.target.value)}
                      rows={3}
                      placeholder={`请输入${currentUser.role === '财务主管' ? '财务复核' : '审批'}意见，通过时可选填，退回时必须填写详细原因...`}
                      className="input resize-none mb-4"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmDialog({ type: 'reject', id: selected.id, node: selected.currentNode })}
                        className="btn-danger !px-6"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        退回修正
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: 'approve', id: selected.id, node: selected.currentNode })}
                        className="btn-success !px-6"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        审批通过
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[500px] rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                <Filter className="w-14 h-14 mb-4 opacity-40" />
                <p className="text-base font-medium">请从左侧选择一条审批记录</p>
                <p className="text-sm mt-1">点击卡片查看详情并进行审批操作</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-modal w-[440px] overflow-hidden animate-slide-up">
            <div className={clsx(
              'px-5 py-4 flex items-center gap-3',
              confirmDialog.type === 'approve' ? 'bg-success-500' : 'bg-danger-500',
            )}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                {confirmDialog.type === 'approve' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
              </div>
              <div className="text-white">
                <h3 className="text-lg font-bold">确认{confirmDialog.type === 'approve' ? '通过' : '退回'}？</h3>
                <p className="text-xs text-white/80">此操作不可撤销</p>
              </div>
            </div>
            <div className="px-5 py-5 text-sm text-neutral-700">
              您即将对申请 <span className="font-mono font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{selected?.applicationNo}</span>{' '}
              执行<span className={clsx('font-bold', confirmDialog.type === 'approve' ? 'text-success-700' : 'text-danger-700')}>
                {confirmDialog.type === 'approve' ? '审批通过' : '退回修正'}
              </span>操作。
            </div>
            <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50">
              <button onClick={() => setConfirmDialog(null)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleConfirm} className={confirmDialog.type === 'approve' ? 'btn-success' : 'btn-danger'}>
                确认{confirmDialog.type === 'approve' ? '通过' : '退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalCenter;
