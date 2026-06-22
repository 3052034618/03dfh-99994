import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Workflow, FileText, Wallet, Shield, ListChecks,
  ChevronRight, Plus, Trash2, Edit2, Save, Check, X, AlertCircle,
  UserCheck, Building2, Clock, Search, Calendar, RotateCcw,
  ExternalLink, ChevronDown, Eye,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { PaymentMethod, AuditLog } from '@/types';
import { PAYMENT_METHODS } from '@/utils/constants';
import StatusBadge from '@/components/ui/StatusBadge';
import clsx from 'clsx';

const tabs = [
  { key: 'approval', label: '审批流配置', icon: Workflow },
  { key: 'voucher', label: '凭证模板', icon: FileText },
  { key: 'fee', label: '手续费规则', icon: Wallet },
  { key: 'permission', label: '权限管理', icon: Shield },
  { key: 'audit', label: '操作日志', icon: ListChecks },
];

const Settings = () => {
  const navigate = useNavigate();
  const { handlingFeeRules, auditLogs, applications, customers, stores, saveHandlingFeeRules, resetHandlingFeeRules } = useAppStore();
  const [activeTab, setActiveTab] = useState('approval');
  const [localFeeRules, setLocalFeeRules] = useState(handlingFeeRules);
  const [feeRulesSnapshot, setFeeRulesSnapshot] = useState<typeof handlingFeeRules>([]);
  const [logFilter, setLogFilter] = useState({ user: '', action: '', startDate: '', endDate: '', applicationNo: '', customerName: '' });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [approvalNodes, setApprovalNodes] = useState([
    { id: 0, name: '创建申请', role: '前台顾问', required: true, editable: false },
    { id: 1, name: '财务复核', role: '财务主管', required: true, editable: true },
    { id: 2, name: '店长审批', role: '门店店长', required: true, editable: true },
    { id: 3, name: '到账登记', role: '前台顾问', required: true, editable: true },
    { id: 4, name: '完成归档', role: '系统', required: true, editable: false },
  ]);

  useEffect(() => {
    if (activeTab === 'fee') {
      const fresh = handlingFeeRules.map(r => ({ ...r }));
      setLocalFeeRules(fresh);
      setFeeRulesSnapshot(fresh.map(r => ({ ...r })));
    }
  }, [activeTab, handlingFeeRules]);

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter.user && !log.userName.includes(logFilter.user)) return false;
    if (logFilter.action && !log.action.includes(logFilter.action)) return false;
    if (logFilter.startDate && log.createdAt < logFilter.startDate) return false;
    if (logFilter.endDate && log.createdAt > logFilter.endDate + ' 23:59:59') return false;
    if (logFilter.applicationNo) {
      const kw = logFilter.applicationNo.toLowerCase();
      const app = applications.find(a => a.id === log.targetId);
      if (!app || !app.applicationNo.toLowerCase().includes(kw)) return false;
    }
    if (logFilter.customerName) {
      const kw = logFilter.customerName.toLowerCase();
      const app = applications.find(a => a.id === log.targetId);
      if (!app || !app.customer.name.toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  const getLinkedApp = (log: AuditLog) => applications.find(a => a.id === log.targetId);
  const getLinkedCustomer = (log: AuditLog) => {
    const app = getLinkedApp(log);
    return app ? customers.find(c => c.id === app.customerId) : undefined;
  };
  const getRelatedLogs = (log: AuditLog) => {
    const app = getLinkedApp(log);
    if (!app) return [];
    return auditLogs.filter(l => l.targetId === app.id && l.targetType === '申请').slice(0, 8);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-600" />
          系统设置
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">配置审批流程、手续费规则、权限管理等系统参数</p>
      </div>

      <div className="grid grid-cols-6 gap-5">
        <div className="col-span-1">
          <div className="card p-2 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                      active ? 'bg-primary-600 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="col-span-5 space-y-5">
          {activeTab === 'approval' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">审批流程配置</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">配置退款申请的多级审批节点和审批人</p>
                </div>
                <button className="btn-secondary !py-1.5">
                  <Plus className="w-4 h-4" />
                  添加条件分支
                </button>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                <h3 className="section-subtitle mb-4">标准审批流程（适用于全部门店）</h3>
                <div className="relative">
                  <div className="absolute left-[28px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary-300 via-medical-300 to-neutral-200 rounded-full" />
                  <div className="space-y-4">
                    {approvalNodes.map((node, idx) => (
                      <div key={node.id} className="flex items-start gap-4 relative z-10">
                        <div className={clsx(
                          'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
                          idx === 0 && 'bg-primary-600 text-white',
                          idx === 1 && 'bg-warning-500 text-white',
                          idx === 2 && 'bg-medical-600 text-white',
                          idx === 3 && 'bg-primary-500 text-white',
                          idx === 4 && 'bg-success-500 text-white',
                        )}>
                          <span className="text-xl font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1 rounded-xl border-2 border-neutral-200 bg-white p-4 hover:border-primary-300 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-neutral-900">{node.name}</h4>
                                {node.required && <span className="badge badge-pending !text-[10px]">必填节点</span>}
                              </div>
                              <p className="text-xs text-neutral-500 mt-0.5">审批角色：{node.role}</p>
                            </div>
                            {node.editable && (
                              <div className="flex items-center gap-1">
                                <button className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 flex items-center justify-center transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  className="w-8 h-8 rounded-lg hover:bg-danger-50 text-danger-500 flex items-center justify-center transition-colors"
                                  disabled={node.required}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-0.5 block">指定审批人</label>
                              <select className="input input-sm" disabled={!node.editable}>
                                <option>按角色自动分配</option>
                                <option>指定具体人员</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-0.5 block">超时处理</label>
                              <select className="input input-sm" disabled={!node.editable}>
                                <option>不处理</option>
                                <option>自动通过</option>
                                <option>升级提醒</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-0.5 block">超时时限</label>
                              <select className="input input-sm" disabled={!node.editable}>
                                <option>24 小时</option>
                                <option>48 小时</option>
                                <option>72 小时</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-5 gap-2">
                <button className="btn-secondary">重置为默认</button>
                <button className="btn-primary">
                  <Save className="w-4 h-4" />
                  保存配置
                </button>
              </div>
            </div>
          )}

          {activeTab === 'fee' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">手续费规则配置</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">按支付方式配置退款手续费扣除比例和上下限</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-danger-50 border border-danger-200 px-3 py-1.5 text-xs text-danger-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  修改后新建申请立即生效，已有申请不受影响
                </div>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>支付方式</th>
                      <th className="text-center">手续费率 (%)</th>
                      <th className="text-center">最低手续费 (元)</th>
                      <th className="text-center">最高手续费 (元)</th>
                      <th className="text-center w-40">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localFeeRules.map((rule, idx) => (
                      <tr key={rule.paymentMethod}>
                        <td className="font-semibold text-neutral-800">{rule.paymentMethod}</td>
                        <td className="text-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={(rule.feeRate * 100).toFixed(2)}
                            onChange={(e) => {
                              const newRules = [...localFeeRules];
                              newRules[idx] = { ...rule, feeRate: parseFloat(e.target.value) / 100 || 0 };
                              setLocalFeeRules(newRules);
                            }}
                            className="w-24 h-8 text-center text-sm rounded-md border border-neutral-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                          <span className="text-xs text-neutral-500 ml-1">%</span>
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.minFee}
                            onChange={(e) => {
                              const newRules = [...localFeeRules];
                              newRules[idx] = { ...rule, minFee: parseFloat(e.target.value) || 0 };
                              setLocalFeeRules(newRules);
                            }}
                            className="w-24 h-8 text-center text-sm rounded-md border border-neutral-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="不限"
                            value={rule.maxFee || ''}
                            onChange={(e) => {
                              const newRules = [...localFeeRules];
                              newRules[idx] = { ...rule, maxFee: e.target.value ? parseFloat(e.target.value) : undefined };
                              setLocalFeeRules(newRules);
                            }}
                            className="w-24 h-8 text-center text-sm rounded-md border border-neutral-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </td>
                        <td className="text-center">
                          <button className="btn-ghost !p-1.5 text-primary-600">
                            <Check className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-5 gap-2">
                <button
                  onClick={() => {
                    if (feeRulesSnapshot.length === 0) return;
                    setLocalFeeRules(feeRulesSnapshot.map(r => ({ ...r })));
                    useAppStore.getState().addNotification('info', '已恢复到进入设置页面时的规则值，未保存');
                  }}
                  className="btn-secondary"
                  title="恢复到进入本页时的配置值"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置（回当前编辑前）
                </button>
                <button
                  onClick={() => {
                    resetHandlingFeeRules();
                  }}
                  className="btn-ghost"
                  title="恢复系统出厂默认值（写入并生效）"
                >
                  恢复默认
                </button>
                <button
                  onClick={() => saveHandlingFeeRules(localFeeRules)}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4" />
                  保存规则
                </button>
              </div>
            </div>
          )}

          {activeTab === 'voucher' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">凭证模板管理</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">配置退款确认单、凭证导出的模板和字段</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary">
                    <FileText className="w-4 h-4" />
                    预览模板
                  </button>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4" />
                    新建模板
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: '退款确认单（标准版）', type: '客户通知', used: 128, fields: 18, default: true },
                  { name: '财务记账凭证', type: '内部财务', used: 256, fields: 24, default: true },
                  { name: '业绩冲减通知单', type: '内部运营', used: 89, fields: 12, default: false },
                  { name: '客户退款短信模板', type: '短信通知', used: 256, fields: 8, default: true },
                ].map((tpl, idx) => (
                  <div key={idx} className="rounded-xl border border-neutral-200 p-5 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-medical-100 flex items-center justify-center text-primary-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-neutral-900">{tpl.name}</h4>
                            {tpl.default && <span className="badge bg-primary-50 text-primary-700 border-primary-200">默认</span>}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">模板类型：{tpl.type}</p>
                        </div>
                      </div>
                      <button className="btn-ghost !p-1.5">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      <span>{tpl.fields} 个字段</span>
                      <span>已使用 {tpl.used} 次</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permission' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">角色权限配置</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">配置各角色的功能访问权限和数据范围</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { name: '前台顾问', users: 24, desc: '门店前台操作人员', color: 'primary' },
                  { name: '财务主管', users: 3, desc: '总部财务核算人员', color: 'warning' },
                  { name: '门店店长', users: 5, desc: '各门店管理者', color: 'medical' },
                  { name: '咨询师', users: 38, desc: '业绩关联人员', color: 'danger' },
                ].map((role, idx) => (
                  <div key={idx} className={clsx(
                    'rounded-xl border-2 p-4 flex items-center gap-4',
                    role.color === 'primary' && 'border-primary-200 bg-primary-50/30',
                    role.color === 'warning' && 'border-warning-200 bg-warning-50/30',
                    role.color === 'medical' && 'border-medical-200 bg-medical-50/30',
                    role.color === 'danger' && 'border-danger-200 bg-danger-50/30',
                  )}>
                    <div className={clsx(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      role.color === 'primary' && 'bg-primary-100 text-primary-600',
                      role.color === 'warning' && 'bg-warning-100 text-warning-600',
                      role.color === 'medical' && 'bg-medical-100 text-medical-600',
                      role.color === 'danger' && 'bg-danger-100 text-danger-600',
                    )}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900">{role.name}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{role.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neutral-800">{role.users}</p>
                      <p className="text-[10px] text-neutral-500">用户数</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-800">权限矩阵 - 财务主管</h3>
                </div>
                <div className="table-wrapper !rounded-none !border-0">
                  <table className="table !rounded-none">
                    <thead>
                      <tr>
                        <th>功能模块</th>
                        <th className="text-center">查看</th>
                        <th className="text-center">创建</th>
                        <th className="text-center">编辑</th>
                        <th className="text-center">审批</th>
                        <th className="text-center">导出</th>
                        <th>数据范围</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['申请列表', true, true, true, false, true, '全部门店'],
                        ['核算详情', true, false, true, true, true, '全部门店'],
                        ['审批中心', true, false, false, true, false, '所有待办'],
                        ['报表看板', true, false, false, false, true, '全部门店'],
                        ['客户档案', true, false, false, false, true, '全部客户'],
                        ['系统设置', true, false, true, false, false, '仅财务配置'],
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold text-neutral-800">{row[0] as string}</td>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <td key={i} className="text-center">
                              {row[i] ? (
                                <span className="inline-flex w-6 h-6 rounded-full bg-success-100 text-success-600 items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 items-center justify-center">
                                  <X className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="text-sm text-neutral-600">{row[6] as string}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">操作日志</h2>
                  <p className="text-sm text-neutral-500 mt-0.5">全系统操作留痕记录，可按操作人、申请单号、客户姓名筛选</p>
                </div>
                <Link to="/settings/audit-log" className="btn-secondary">
                  展开查看全部
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-6 gap-3 mb-4">
                <div>
                  <label className="label text-xs">操作人</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      value={logFilter.user}
                      onChange={(e) => setLogFilter({ ...logFilter, user: e.target.value })}
                      placeholder="搜索姓名..."
                      className="input input-sm pl-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">操作类型</label>
                  <select
                    value={logFilter.action}
                    onChange={(e) => setLogFilter({ ...logFilter, action: e.target.value })}
                    className="input input-sm"
                  >
                    <option value="">全部操作</option>
                    <option>创建申请</option>
                    <option>保存核算</option>
                    <option>审批通过</option>
                    <option>审批退回</option>
                    <option>提交审批</option>
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
                      value={logFilter.applicationNo}
                      onChange={(e) => setLogFilter({ ...logFilter, applicationNo: e.target.value })}
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
                      value={logFilter.customerName}
                      onChange={(e) => setLogFilter({ ...logFilter, customerName: e.target.value })}
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
                      value={logFilter.startDate}
                      onChange={(e) => setLogFilter({ ...logFilter, startDate: e.target.value })}
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
                      value={logFilter.endDate}
                      onChange={(e) => setLogFilter({ ...logFilter, endDate: e.target.value })}
                      className="input input-sm pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-0">
                {filteredLogs.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400">
                    <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">无匹配的操作日志</p>
                  </div>
                ) : (
                  filteredLogs.slice(0, 50).map((log) => {
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
                              ['创建申请', '提交审批', '保存核算', '登录系统', '发送通知'].includes(log.action) && 'badge-draft',
                              ['审批通过', '登记到账', '修改配置'].includes(log.action) && 'badge-approved',
                              log.action === '审批退回' && 'badge-rejected',
                            )}>
                              {log.action}
                            </span>
                          </div>
                          <div className="col-span-1 text-xs text-neutral-500">{log.targetType}</div>
                          <div className="col-span-4 text-sm text-neutral-700 truncate">{log.detail}</div>
                          <div className="col-span-1 flex items-center justify-end gap-1">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
