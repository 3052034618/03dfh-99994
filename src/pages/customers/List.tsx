import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowRight, Phone, Mail, MapPin, Calendar,
  FileText, CreditCard, TrendingUp, Send, Bell, ChevronRight,
  UserCircle, Clock, CheckCircle, AlertTriangle, Eye, MessageSquare,
  Sparkles, ExternalLink,
} from 'lucide-react';
import { useAppStore, type CustomerNotification } from '@/store';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime, formatPhone } from '@/utils/format';
import { MEMBER_LEVEL_COLORS } from '@/utils/constants';
import clsx from 'clsx';

const STATUS_TEMPLATE_RECOMMEND: Record<string, CustomerNotification['templateType']> = {
  '草稿': 'refund_confirm',
  '待财务复核': 'refund_confirm',
  '财务退回': 'refund_reject',
  '待店长审批': 'refund_confirm',
  '店长驳回': 'refund_reject',
  '待到账登记': 'refund_success',
  '已完成': 'refund_success',
};

const TEMPLATE_META: { key: CustomerNotification['templateType']; title: string; desc: string; color: string }[] = [
  { key: 'refund_confirm', title: '退款确认单', desc: '含详细退款明细，供客户核对确认', color: 'primary' },
  { key: 'refund_success', title: '到账提醒', desc: '退款成功，款项已退回原支付账户', color: 'success' },
  { key: 'refund_reject', title: '审批退回通知', desc: '告知申请被退回原因及修正建议', color: 'warning' },
];

const CustomerList = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { customers, applications, auditLogs, originalOrders: orders, sendCustomerNotification, getNotificationsByCustomerId } = useAppStore();
  const [search, setSearch] = useState('');
  const [notifyTemplate, setNotifyTemplate] = useState<CustomerNotification['templateType']>('refund_confirm');
  const [notifyChannel, setNotifyChannel] = useState<CustomerNotification['channel']>('短信');
  const [notifyAppId, setNotifyAppId] = useState<string>('');
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const kw = search.toLowerCase();
    return c.name.toLowerCase().includes(kw)
      || c.phone.includes(kw)
      || c.memberLevel.includes(kw);
  });

  const selectedCustomer = id ? customers.find((c) => c.id === id) : null;
  const customerApps = selectedCustomer ? applications.filter((a) => a.customerId === selectedCustomer.id) : [];
  const customerOrders = selectedCustomer ? orders.filter((o) => o.customerId === selectedCustomer.id) : [];

  const selectedApp = useMemo(() => {
    if (!notifyAppId || !selectedCustomer) return customerApps[0] || null;
    return customerApps.find(a => a.id === notifyAppId) || customerApps[0] || null;
  }, [notifyAppId, customerApps, selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      setNotifyAppId('');
      setNotifyTemplate('refund_confirm');
      setNotifyChannel('短信');
      setExpandedNotifId(null);
    }
  }, [selectedCustomer?.id]);

  useEffect(() => {
    if (selectedApp) {
      const recommended = STATUS_TEMPLATE_RECOMMEND[selectedApp.status];
      if (recommended) setNotifyTemplate(recommended);
    }
  }, [selectedApp?.id, selectedApp?.status]);

  const navigateCustomer = (cid: string) => {
    navigate(`/customers/${cid}`);
  };

  if (selectedCustomer) {
    return (
      <div className="space-y-5 animate-slide-up">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link to="/customers" className="hover:text-primary-600 transition-colors">
            <Users className="w-4 h-4 inline mr-1" />
            客户档案
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-800 font-medium">{selectedCustomer.name}</span>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            <CustomerInfoCard customer={selectedCustomer} />

            <div className="card p-5">
              <h3 className="section-title">
                <span className="w-1 h-5 rounded bg-medical-600" />
                账户概览
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-xl p-4 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
                  <p className="text-xs text-primary-600 mb-1">累计消费</p>
                  <p className="text-xl font-bold font-mono text-primary-800">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-medical-50 to-white border border-medical-100">
                  <p className="text-xs text-medical-600 mb-1">储值余额</p>
                  <p className="text-xl font-bold font-mono text-medical-800">{formatCurrency(38500)}</p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-warning-50 to-white border border-warning-100">
                  <p className="text-xs text-warning-600 mb-1">剩余项目</p>
                  <p className="text-xl font-bold text-warning-800">{customerOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.remainingCount, 0), 0)} 次</p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-danger-50 to-white border border-danger-100">
                  <p className="text-xs text-danger-600 mb-1">历史退款</p>
                  <p className="text-xl font-bold text-danger-800">{selectedCustomer.refundCount} 次</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title !mb-0">
                  <span className="w-1 h-5 rounded bg-primary-600" />
                  退款记录时间线
                </h3>
                <button className="btn-ghost !py-1.5 !text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  查看全部订单
                </button>
              </div>

              {customerApps.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">暂无退款记录</p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 via-medical-300 to-neutral-200 rounded-full" />
                  {customerApps.map((app) => (
                    <div key={app.id} className="relative pb-8 last:pb-0">
                      <div className={clsx(
                        'absolute -left-5.5 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        app.status === '已完成' ? 'bg-success-100 border-success-400' :
                        ['待财务复核', '待店长审批', '待到账登记'].includes(app.status) ? 'bg-warning-100 border-warning-400' :
                        app.status === '已取消' ? 'bg-neutral-100 border-neutral-300' :
                        'bg-danger-100 border-danger-400',
                      )}>
                        {app.status === '已完成' ? <CheckCircle className="w-2.5 h-2.5 text-success-600" /> :
                         ['待财务复核', '待店长审批', '待到账登记'].includes(app.status) ? <Clock className="w-2.5 h-2.5 text-warning-600" /> :
                         app.status === '已取消' ? <Clock className="w-2.5 h-2.5 text-neutral-500" /> :
                         <AlertTriangle className="w-2.5 h-2.5 text-danger-600" />}
                      </div>
                      <div className="rounded-xl border border-neutral-200 p-4 hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-mono text-xs font-bold text-primary-700">{app.applicationNo}</p>
                              <StatusBadge status={app.status} />
                            </div>
                            <p className="text-[11px] text-neutral-500">{formatDateTime(app.createdAt)} · {app.storeName}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className="btn-ghost !p-1.5"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-xs text-neutral-400">退项：</span>
                            <span className="font-semibold text-neutral-700">{app.itemSplits.length}项</span>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-400">原订单：</span>
                            <span className="font-mono text-neutral-600 text-xs">{app.originalOrder.orderNo}</span>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs text-neutral-400">实退：</span>
                            <span className="font-mono font-bold text-danger-700">{formatCurrency(app.finalRefund)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="section-title">
                <Bell className="w-4 h-4 text-primary-600" />
                客户通知
                <span className="ml-auto text-[10px] font-normal text-neutral-400">
                  累计发送 {getNotificationsByCustomerId(selectedCustomer.id).length} 条
                </span>
              </h3>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block flex items-center gap-1">
                    关联退款申请 <span className="text-danger-600">*</span>
                    <span className="text-[10px] text-neutral-400 ml-auto">
                      {customerApps.length === 0 ? '该客户暂无退款申请' : `共 ${customerApps.length} 条退款申请`}
                    </span>
                  </label>
                  {customerApps.length === 0 ? (
                    <div className="p-3 rounded-lg bg-neutral-50 border border-dashed border-neutral-200 text-xs text-neutral-400 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-warning-500" />
                      <span>
                        该客户暂无退款申请记录，无法发送退款相关通知。
                        请先在<a className="text-primary-600 underline mx-1" onClick={(e) => { e.preventDefault(); navigate('/applications/new'); }}>新建退款申请</a>
                        后再发送通知。
                      </span>
                    </div>
                  ) : (
                    <select
                      value={selectedApp?.id || ''}
                      onChange={(e) => setNotifyAppId(e.target.value)}
                      className="w-full h-10 text-sm rounded-lg border border-neutral-200 px-3 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      {customerApps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.applicationNo} · 实退 {formatCurrency(a.finalRefund)} · {a.status} · {formatDateTime(a.createdAt).slice(0, 16)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedApp && (
                  <div className="p-3 rounded-lg bg-primary-50/50 border border-primary-100 space-y-2">
                    <p className="text-[11px] font-semibold text-primary-700 flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5" />
                      申请信息摘要
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      <div><span className="text-neutral-400">客户：</span><span className="text-neutral-700 font-medium">{selectedApp.customer.name}</span></div>
                      <div><span className="text-neutral-400">申请号：</span><span className="font-mono text-primary-700">{selectedApp.applicationNo}</span></div>
                      <div><span className="text-neutral-400">实退金额：</span><span className="font-mono font-semibold text-danger-700">{formatCurrency(selectedApp.finalRefund)}</span></div>
                      <div><span className="text-neutral-400">退款方式：</span><span className="text-neutral-700">{selectedApp.refundMethod || '待登记'}</span></div>
                      <div><span className="text-neutral-400">当前状态：</span><StatusBadge status={selectedApp.status} /></div>
                      <div><span className="text-neutral-400">手续费：</span><span className="font-mono text-neutral-600">{formatCurrency(selectedApp.handlingFee)}</span></div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block flex items-center gap-1">
                    通知模板
                    {selectedApp && STATUS_TEMPLATE_RECOMMEND[selectedApp.status] && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-medical-600">
                        <Sparkles className="w-3 h-3" />
                        推荐：{TEMPLATE_META.find(t => t.key === STATUS_TEMPLATE_RECOMMEND[selectedApp.status])?.title}
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {TEMPLATE_META.map((t) => {
                      const isRecommended = selectedApp && STATUS_TEMPLATE_RECOMMEND[selectedApp.status] === t.key;
                      return (
                        <div
                          key={t.key}
                          onClick={() => customerApps.length > 0 && setNotifyTemplate(t.key)}
                          className={clsx(
                            'p-3 rounded-lg border transition-all relative',
                            customerApps.length === 0 ? 'opacity-50 cursor-not-allowed border-neutral-100 bg-neutral-50' : 'cursor-pointer',
                            notifyTemplate === t.key && customerApps.length > 0
                              ? 'border-primary-500 bg-primary-50 shadow-sm'
                              : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30'
                          )}
                        >
                          {isRecommended && customerApps.length > 0 && (
                            <span className="absolute top-1.5 right-2 text-[9px] bg-medical-100 text-medical-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> 推荐
                            </span>
                          )}
                          <p className="text-sm font-semibold flex items-center gap-2"
                            style={{ color: notifyTemplate === t.key && customerApps.length > 0 ? '#1e3a5f' : '#262626' }}>
                            <Send className={clsx('w-3.5 h-3.5', notifyTemplate === t.key ? 'text-primary-600' : 'text-primary-500')} />
                            {t.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{t.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">发送渠道</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['短信', '站内信', '邮件'] as const).map(c => (
                      <button
                        key={c}
                        disabled={customerApps.length === 0}
                        onClick={() => setNotifyChannel(c)}
                        className={clsx(
                          'h-8 rounded border text-xs transition-all',
                          customerApps.length === 0 && 'opacity-50 cursor-not-allowed',
                          notifyChannel === c
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-neutral-200 text-neutral-500 hover:border-primary-300'
                        )}
                      >
                        {c === '短信' ? '📱' : c === '站内信' ? '💬' : '📧'} {c}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedApp && (
                  <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-[11px] font-semibold text-neutral-600 mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      发送预览 · {notifyChannel}
                    </p>
                    <div className="p-3 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {buildPreviewContent(selectedApp, notifyTemplate, selectedCustomer, notifyChannel)}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1.5">💡 切换模板或渠道，预览内容将自动更新</p>
                  </div>
                )}

                <button
                  disabled={customerApps.length === 0 || !selectedApp}
                  onClick={() => {
                    if (!selectedApp) return;
                    sendCustomerNotification({
                      customerId: selectedCustomer.id,
                      templateType: notifyTemplate,
                      applicationId: selectedApp.id,
                      channel: notifyChannel,
                    });
                  }}
                  className={clsx(
                    'btn-primary w-full',
                    (customerApps.length === 0 || !selectedApp) && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                  立即发送{TEMPLATE_META.find(t => t.key === notifyTemplate)?.title || '通知'}
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    发送历史记录
                  </p>
                </div>
                {(() => {
                  const history = getNotificationsByCustomerId(selectedCustomer.id);
                  if (history.length === 0) {
                    return (
                      <div className="py-6 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                        <p className="text-xs text-neutral-400">暂无发送记录</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                      {history.slice(0, 30).map((n) => {
                        const isExpanded = expandedNotifId === n.id;
                        return (
                          <div key={n.id}
                            className={clsx(
                              'rounded-lg border transition-all',
                              isExpanded ? 'border-primary-200 bg-primary-50/30' : 'border-neutral-100 bg-neutral-50 hover:bg-neutral-100/70'
                            )}
                          >
                            <div
                              className="p-2.5 cursor-pointer"
                              onClick={() => setExpandedNotifId(isExpanded ? null : n.id)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1.5">
                                  <span className={clsx(
                                    'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                                    n.templateType === 'refund_confirm' && 'bg-primary-100 text-primary-700',
                                    n.templateType === 'refund_success' && 'bg-success-100 text-success-700',
                                    n.templateType === 'refund_reject' && 'bg-warning-100 text-warning-700',
                                  )}>
                                    {n.templateName}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">{n.channel}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                  {n.applicationNo && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const app = applications.find(a => a.applicationNo === n.applicationNo);
                                        if (app) navigate(`/applications/${app.id}`);
                                      }}
                                      className="text-[10px] font-mono text-primary-600 hover:text-primary-800 flex items-center gap-0.5"
                                    >
                                      {n.applicationNo} <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                  <ChevronRight className={clsx('w-3 h-3 text-neutral-300 transition-transform', isExpanded && 'rotate-90')} />
                                </span>
                              </div>
                              <p className={clsx('text-[11px] text-neutral-600 leading-relaxed', isExpanded ? '' : 'line-clamp-2')}>
                                {n.content}
                              </p>
                              <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-200/60">
                                <span className="text-[10px] text-neutral-400">{formatDateTime(n.sentAt)}</span>
                                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                  <UserCircle className="w-3 h-3" /> {n.sentBy}
                                </span>
                              </div>
                            </div>
                            {isExpanded && n.applicationId && (() => {
                              const linkedApp = applications.find(a => a.id === n.applicationId);
                              if (!linkedApp) return null;
                              const notifNodeIdx = (() => {
                                const appLogs = auditLogs.filter(l => l.targetId === linkedApp.id && l.targetType === '申请' && l.createdAt <= n.sentAt);
                                const lastLog = appLogs[0];
                                return lastLog?.stateChange?.currentNodeAfter ?? linkedApp.currentNode;
                              })();
                              const nodeNames = ['创建申请', '财务复核', '店长审批', '到账登记', '完成归档'];
                              return (
                                <div className="px-2.5 pb-2.5 pt-0">
                                  <div className="p-2 rounded-lg bg-white border border-neutral-200 text-[10px]">
                                    <p className="font-semibold text-neutral-600 mb-1.5">关联申请详情</p>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                      <div><span className="text-neutral-400">申请号：</span><span className="font-mono text-primary-700">{linkedApp.applicationNo}</span></div>
                                      <div><span className="text-neutral-400">实退：</span><span className="font-mono text-danger-700">{formatCurrency(linkedApp.finalRefund)}</span></div>
                                      <div><span className="text-neutral-400">状态：</span><StatusBadge status={linkedApp.status} /></div>
                                      <div><span className="text-neutral-400">退款方式：</span><span className="text-neutral-700">{linkedApp.refundMethod || '待登记'}</span></div>
                                      <div><span className="text-neutral-400">门店：</span><span className="text-neutral-700">{linkedApp.storeName}</span></div>
                                      <div><span className="text-neutral-400">创建：</span><span className="text-neutral-600">{formatDateTime(linkedApp.createdAt).slice(0, 16)}</span></div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-neutral-100">
                                      <p className="text-neutral-500 mb-1.5">通知发出时退款流程位置</p>
                                      <div className="flex items-center gap-1">
                                        {nodeNames.map((nn, idx) => (
                                          <div key={idx} className="flex items-center gap-1">
                                            <div className={clsx(
                                              'px-1.5 py-0.5 rounded text-[9px] font-medium',
                                              idx < notifNodeIdx ? 'bg-success-100 text-success-700' :
                                              idx === notifNodeIdx ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300' :
                                              'bg-neutral-100 text-neutral-400'
                                            )}>
                                              {nn}
                                            </div>
                                            {idx < nodeNames.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-neutral-300" />}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => navigate(`/applications/${linkedApp.id}`)}
                                      className="mt-2 text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" /> 查看核算详情
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="section-title">
                <FileText className="w-4 h-4 text-neutral-500" />
                联系信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400">手机号</p>
                    <p className="font-mono font-semibold text-neutral-800">{formatPhone(selectedCustomer.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50">
                  <div className="w-9 h-9 rounded-lg bg-medical-100 text-medical-600 flex items-center justify-center">
                    <UserCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400">会员等级</p>
                    <p className="font-semibold text-neutral-800">
                      <span className={clsx('badge', MEMBER_LEVEL_COLORS[selectedCustomer.memberLevel])}>
                        {selectedCustomer.memberLevel}会员
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50">
                  <div className="w-9 h-9 rounded-lg bg-warning-100 text-warning-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400">会员注册</p>
                    <p className="font-semibold text-neutral-800">{formatDateTime(selectedCustomer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">客户档案</h1>
          <p className="text-sm text-neutral-500 mt-0.5">查看客户信息、历史订单和退款记录</p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索客户姓名/手机号/等级..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm text-neutral-500 mb-4">共 {filtered.length} 位客户</p>
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigateCustomer(c.id)}
              className="rounded-xl border-2 border-neutral-200 p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <CustomerInfoCard customer={c} compact />
                <ChevronRight className="w-5 h-5 text-neutral-300" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100">
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">累计消费</p>
                  <p className="font-mono font-bold text-[13px] text-primary-700">{formatCurrency(c.totalSpent, 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">退款次数</p>
                  <p className={clsx('font-bold text-[13px]', c.refundCount > 0 ? 'text-warning-700' : 'text-neutral-500')}>
                    {c.refundCount}次
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">订单数</p>
                  <p className="font-bold text-[13px] text-medical-700">
                    {orders.filter((o) => o.customerId === c.id).length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function buildPreviewContent(
  app: { applicationNo: string; customer: { name: string }; finalRefund: number; refundMethod?: string; status: string; handlingFee: number },
  templateType: CustomerNotification['templateType'],
  customer: { name: string } | null,
  channel: CustomerNotification['channel']
): string {
  const name = customer?.name || app.customer.name || '客户';
  const isSMS = channel === '短信';
  const isEmail = channel === '邮件';
  const prefix = (tag: string) => isSMS ? `【${tag}】` : '';
  const emailFooter = isEmail ? '\n\n如有疑问请致电 400-XXX-XXXX' : '';

  switch (templateType) {
    case 'refund_confirm': {
      const base = `尊敬的${name}您好，您的退款申请${app.applicationNo}已提交，预计实退金额¥${app.finalRefund.toFixed(2)}（含手续费¥${app.handlingFee.toFixed(2)}）。请核对明细，如有疑问请联系客服。`;
      if (isEmail) return `【医美退款确认单】\n\n${base}\n\n申请单号：${app.applicationNo}\n实退金额：¥${app.finalRefund.toFixed(2)}\n手续费：¥${app.handlingFee.toFixed(2)}${emailFooter}`;
      return `${prefix('退款确认')}${base}`;
    }
    case 'refund_success': {
      const base = `${name}您好，退款申请${app.applicationNo}已处理完成，款项¥${app.finalRefund.toFixed(2)}已按${app.refundMethod || '原路退回'}方式处理，预计1-7个工作日内到账。`;
      if (isEmail) return `【医美退款到账提醒】\n\n${base}\n\n申请单号：${app.applicationNo}\n到账金额：¥${app.finalRefund.toFixed(2)}\n退款方式：${app.refundMethod || '原路退回'}\n预计到账：1-7个工作日${emailFooter}`;
      return `${prefix('到账提醒')}${base}`;
    }
    case 'refund_reject': {
      const base = `${name}您好，您的退款申请${app.applicationNo}因信息需要补充，已退回门店处理，门店顾问将在1个工作日内与您联系。`;
      if (isEmail) return `【医美退款申请退回通知】\n\n${base}\n\n申请单号：${app.applicationNo}\n状态：已退回门店\n预计回复：1个工作日内${emailFooter}`;
      return `${prefix('退款提醒')}${base}`;
    }
    default:
      return '';
  }
}

export default CustomerList;
