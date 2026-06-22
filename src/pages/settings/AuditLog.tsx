import { useAppStore } from '@/store';
import { formatCurrency, formatDateTime } from '@/utils/format';
import {
  Search, Calendar, ArrowLeft, ListChecks, FileText, UserCheck,
  ChevronRight, ChevronDown, ExternalLink, Eye,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/ui/StatusBadge';
import clsx from 'clsx';

const AuditLog = () => {
  const navigate = useNavigate();
  const { auditLogs, applications, customers } = useAppStore();
  const [filter, setFilter] = useState({ user: '', action: '', start: '', end: '', applicationNo: '', customerName: '' });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filtered = auditLogs.filter((log) => {
    if (filter.user && !log.userName.includes(filter.user)) return false;
    if (filter.action && !log.action.includes(filter.action)) return false;
    if (filter.start && log.createdAt < filter.start) return false;
    if (filter.end && log.createdAt > filter.end + ' 23:59:59') return false;
    if (filter.applicationNo) {
      const kw = filter.applicationNo.toLowerCase();
      const app = applications.find(a => a.id === log.targetId);
      if (!app || !app.applicationNo.toLowerCase().includes(kw)) return false;
    }
    if (filter.customerName) {
      const kw = filter.customerName.toLowerCase();
      const app = applications.find(a => a.id === log.targetId);
      if (!app || !app.customer.name.toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  const getLinkedApp = (log: typeof auditLogs[0]) => applications.find(a => a.id === log.targetId);
  const getLinkedCustomer = (log: typeof auditLogs[0]) => {
    const app = getLinkedApp(log);
    return app ? customers.find(c => c.id === app.customerId) : undefined;
  };
  const getRelatedLogs = (log: typeof auditLogs[0]) => {
    const app = getLinkedApp(log);
    if (!app) return [];
    return auditLogs.filter(l => l.targetId === app.id && l.targetType === '申请').slice(0, 20);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center gap-3">
        <Link to="/settings" className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary-600" />
            全量操作日志
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">完整的系统操作审计记录，支持按申请单号和客户姓名检索</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-6 gap-3 mb-4">
          <div>
            <label className="label text-xs">操作人</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                value={filter.user}
                onChange={(e) => setFilter({ ...filter, user: e.target.value })}
                placeholder="搜索姓名..."
                className="input input-sm pl-8"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">操作类型</label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="input input-sm"
            >
              <option value="">全部操作</option>
              <option>创建申请</option>
              <option>保存核算</option>
              <option>提交审批</option>
              <option>审批通过</option>
              <option>审批退回</option>
              <option>登记到账</option>
              <option>发送通知</option>
              <option>修改配置</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">申请单号</label>
            <div className="relative">
              <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                value={filter.applicationNo}
                onChange={(e) => setFilter({ ...filter, applicationNo: e.target.value })}
                placeholder="RF2026..."
                className="input input-sm pl-8 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">客户姓名</label>
            <div className="relative">
              <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                value={filter.customerName}
                onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
                placeholder="搜索客户..."
                className="input input-sm pl-8"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">开始日期</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="date"
                value={filter.start}
                onChange={(e) => setFilter({ ...filter, start: e.target.value })}
                className="input input-sm pl-8"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">结束日期</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="date"
                value={filter.end}
                onChange={(e) => setFilter({ ...filter, end: e.target.value })}
                className="input input-sm pl-8"
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-neutral-500 mb-3">共 {filtered.length} 条操作记录</p>

        <div className="space-y-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">无匹配的操作日志</p>
            </div>
          ) : (
            filtered.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const linkedApp = getLinkedApp(log);
              const linkedCustomer = getLinkedCustomer(log);
              const relatedLogs = isExpanded && linkedApp ? getRelatedLogs(log) : [];
              return (
                <div key={log.id} className={clsx(
                  'border-b last:border-b-0 transition-all',
                  isExpanded ? 'bg-primary-50/30' : 'hover:bg-neutral-50'
                )}>
                  <div
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  >
                    <div className="col-span-2 text-xs text-neutral-500 font-mono">{formatDateTime(log.createdAt)}</div>
                    <div className="col-span-1 font-medium text-neutral-800 text-sm">{log.userName}</div>
                    <div className="col-span-1">
                      <span className={clsx(
                        'badge text-[10px]',
                        log.userRole === '财务主管' && 'bg-warning-50 text-warning-700 border-warning-200',
                        log.userRole === '门店店长' && 'bg-medical-50 text-medical-700 border-medical-200',
                        log.userRole === '前台顾问' && 'bg-primary-50 text-primary-700 border-primary-200',
                      )}>
                        {log.userRole}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className={clsx(
                        'badge text-[10px]',
                        ['创建申请', '提交审批', '保存核算', '发送通知'].includes(log.action) && 'badge-draft',
                        ['审批通过', '登记到账', '修改配置'].includes(log.action) && 'badge-approved',
                        log.action === '审批退回' && 'badge-rejected',
                      )}>
                        {log.action}
                      </span>
                    </div>
                    <div className="col-span-1 text-xs text-neutral-500">{log.targetType}</div>
                    <div className="col-span-4 text-sm text-neutral-700 truncate">{log.detail}</div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {linkedApp && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/applications/${linkedApp.id}`); }}
                          className="w-6 h-6 rounded flex items-center justify-center text-primary-500 hover:bg-primary-50"
                          title="查看关联申请"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronDown className={clsx('w-4 h-4 text-neutral-400 transition-transform', isExpanded && 'rotate-180')} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-neutral-600 mb-2">关联申请</p>
                            {linkedApp ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-primary-700">{linkedApp.applicationNo}</span>
                                  <StatusBadge status={linkedApp.status} />
                                  <button
                                    onClick={() => navigate(`/applications/${linkedApp.id}`)}
                                    className="text-primary-600 hover:text-primary-800"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                  <div><span className="text-neutral-400">门店：</span><span className="text-neutral-700">{linkedApp.storeName}</span></div>
                                  <div><span className="text-neutral-400">实退：</span><span className="font-mono text-danger-700">{formatCurrency(linkedApp.finalRefund)}</span></div>
                                  <div><span className="text-neutral-400">退款方式：</span><span className="text-neutral-700">{linkedApp.refundMethod || '待登记'}</span></div>
                                  <div><span className="text-neutral-400">创建时间：</span><span className="text-neutral-600">{formatDateTime(linkedApp.createdAt).slice(0, 16)}</span></div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400">非申请关联日志</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-neutral-600 mb-2">关联客户</p>
                            {linkedCustomer ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-neutral-800">{linkedCustomer.name}</span>
                                  <span className="badge bg-primary-50 text-primary-700 border-primary-200 text-[10px]">{linkedCustomer.memberLevel}会员</span>
                                  <button
                                    onClick={() => navigate(`/customers/${linkedCustomer.id}`)}
                                    className="text-primary-600 hover:text-primary-800"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                  <div><span className="text-neutral-400">手机：</span><span className="font-mono text-neutral-600">{linkedCustomer.phone}</span></div>
                                  <div><span className="text-neutral-400">累计消费：</span><span className="font-mono text-neutral-600">{formatCurrency(linkedCustomer.totalSpent)}</span></div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400">非客户关联日志</p>
                            )}
                          </div>
                        </div>

                        {log.stateChange && (
                          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                            <p className="text-xs font-semibold text-neutral-600 mb-2">状态变化</p>
                            <div className="grid grid-cols-2 gap-4">
                              {log.stateChange.statusBefore !== undefined && (
                                <>
                                  <div>
                                    <p className="text-[10px] text-neutral-400 mb-1">操作前</p>
                                    <StatusBadge status={log.stateChange.statusBefore || '—'} />
                                    {log.stateChange.currentNodeBefore !== undefined && (
                                      <p className="text-[10px] text-neutral-400 mt-1">节点 {log.stateChange.currentNodeBefore}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-neutral-400 mb-1">操作后</p>
                                    <StatusBadge status={log.stateChange.statusAfter || '—'} />
                                    {log.stateChange.currentNodeAfter !== undefined && (
                                      <p className="text-[10px] text-neutral-400 mt-1">节点 {log.stateChange.currentNodeAfter}</p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-neutral-200/60">
                              {log.stateChange.finalRefundBefore !== undefined && log.stateChange.finalRefundAfter !== undefined && (
                                <div>
                                  <p className="text-[10px] text-neutral-400">实退金额</p>
                                  <p className="text-[11px]">
                                    <span className="font-mono text-neutral-500">{formatCurrency(log.stateChange.finalRefundBefore)}</span>
                                    <span className="mx-1.5 text-neutral-300">→</span>
                                    <span className={clsx(
                                      'font-mono font-medium',
                                      Math.abs(log.stateChange.finalRefundAfter - log.stateChange.finalRefundBefore) > 0.001 ? 'text-warning-700' : 'text-neutral-700'
                                    )}>{formatCurrency(log.stateChange.finalRefundAfter)}</span>
                                  </p>
                                </div>
                              )}
                              {(log.stateChange.refundMethodBefore || log.stateChange.refundMethodAfter) && (
                                <div>
                                  <p className="text-[10px] text-neutral-400">退款方式</p>
                                  <p className="text-[11px]">
                                    <span className="text-neutral-500">{log.stateChange.refundMethodBefore || '—'}</span>
                                    <span className="mx-1.5 text-neutral-300">→</span>
                                    <span className="font-medium text-primary-700">{log.stateChange.refundMethodAfter || '—'}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {linkedApp && relatedLogs.length > 1 && (
                          <div>
                            <p className="text-xs font-semibold text-neutral-600 mb-2">
                              退款全流程轨迹
                              <span className="font-normal text-neutral-400 ml-1">（{relatedLogs.length} 条相关操作）</span>
                            </p>
                            <div className="relative pl-6">
                              <div className="absolute left-2 top-1 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 via-medical-300 to-neutral-200 rounded-full" />
                              <div className="space-y-2">
                                {relatedLogs.map((rl) => (
                                  <div key={rl.id} className="relative flex items-start gap-3">
                                    <div className={clsx(
                                      'absolute -left-4 w-3 h-3 rounded-full border-2 mt-1',
                                      ['创建申请', '提交审批', '保存核算', '发送通知'].includes(rl.action) && 'bg-primary-100 border-primary-400',
                                      ['审批通过', '登记到账'].includes(rl.action) && 'bg-success-100 border-success-400',
                                      rl.action === '审批退回' && 'bg-danger-100 border-danger-400',
                                      ['修改配置'].includes(rl.action) && 'bg-neutral-100 border-neutral-400',
                                    )} />
                                    <div className="flex-1 text-[11px]">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-neutral-400">{formatDateTime(rl.createdAt).slice(5)}</span>
                                        <span className={clsx(
                                          'font-medium',
                                          ['审批通过', '登记到账'].includes(rl.action) && 'text-success-700',
                                          rl.action === '审批退回' && 'text-danger-700',
                                          !['审批通过', '登记到账', '审批退回'].includes(rl.action) && 'text-neutral-700',
                                        )}>{rl.action}</span>
                                        <span className="text-neutral-400">{rl.userName}</span>
                                        {rl.stateChange?.statusAfter && (
                                          <span className="text-[9px] text-neutral-400">→ {rl.stateChange.statusAfter}</span>
                                        )}
                                      </div>
                                      <p className="text-neutral-500 mt-0.5">{rl.detail}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] text-neutral-400">
                          <span>日志ID: {log.id} · IP: {log.ip || '-'}</span>
                          {linkedApp && (
                            <button
                              onClick={() => navigate(`/applications/${linkedApp.id}`)}
                              className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> 查看核算详情
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
