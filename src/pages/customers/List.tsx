import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowRight, Phone, Mail, MapPin, Calendar,
  FileText, CreditCard, TrendingUp, Send, Bell, ChevronRight,
  UserCircle, Clock, CheckCircle, AlertTriangle, Eye, MessageSquare,
} from 'lucide-react';
import { useAppStore, type CustomerNotification } from '@/store';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime, formatPhone } from '@/utils/format';
import { MEMBER_LEVEL_COLORS } from '@/utils/constants';
import clsx from 'clsx';

const CustomerList = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { customers, applications, originalOrders: orders, sendCustomerNotification, getNotificationsByCustomerId } = useAppStore();
  const [search, setSearch] = useState('');
  const [notifyTemplate, setNotifyTemplate] = useState<CustomerNotification['templateType']>('refund_confirm');
  const [notifyChannel, setNotifyChannel] = useState<CustomerNotification['channel']>('短信');

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
                  <label className="text-xs text-neutral-500 mb-1 block">通知模板</label>
                  <div className="space-y-2">
                    {[
                      { key: 'refund_confirm' as const, title: '退款确认单', desc: '含详细退款明细，供客户核对确认' },
                      { key: 'refund_success' as const, title: '到账提醒', desc: '退款成功，款项已退回原支付账户' },
                      { key: 'refund_reject' as const, title: '审批退回通知', desc: '告知申请被退回原因及修正建议' },
                    ].map((t) => (
                      <div
                        key={t.key}
                        onClick={() => setNotifyTemplate(t.key)}
                        className={clsx(
                          'p-3 rounded-lg border cursor-pointer transition-all',
                          notifyTemplate === t.key
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30'
                        )}
                      >
                        <p className="text-sm font-semibold flex items-center gap-2"
                          style={{ color: notifyTemplate === t.key ? '#1e3a5f' : '#262626' }}>
                          <Send className={clsx('w-3.5 h-3.5', notifyTemplate === t.key ? 'text-primary-600' : 'text-primary-500')} />
                          {t.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">发送渠道</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['短信', '站内信', '邮件'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => setNotifyChannel(c)}
                        className={clsx(
                          'h-8 rounded border text-xs transition-all',
                          notifyChannel === c
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-neutral-200 text-neutral-500 hover:border-primary-300'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => sendCustomerNotification({
                    customerId: selectedCustomer.id,
                    templateType: notifyTemplate,
                    channel: notifyChannel,
                  })}
                  className="btn-primary w-full"
                >
                  <Send className="w-4 h-4" />
                  立即发送{notifyTemplate === 'refund_confirm' ? '退款确认单' : notifyTemplate === 'refund_success' ? '到账提醒' : '审批退回通知'}
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
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {history.slice(0, 30).map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/70 transition-all">
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
                            {n.applicationNo && (
                              <span className="text-[10px] font-mono text-neutral-400">
                                {n.applicationNo}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2">{n.content}</p>
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-200/60">
                            <span className="text-[10px] text-neutral-400">{formatDateTime(n.sentAt)}</span>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                              <UserCircle className="w-3 h-3" /> {n.sentBy}
                            </span>
                          </div>
                        </div>
                      ))}
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

export default CustomerList;
