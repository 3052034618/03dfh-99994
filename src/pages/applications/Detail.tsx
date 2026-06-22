import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Package, Calculator, Users, UserCheck,
  Save, Send, Printer, Download, Check, X, MinusCircle, Plus,
  Wallet, CreditCard, TrendingDown, AlertCircle, Stethoscope, User, Network,
  MessageSquare, ThumbsUp, ThumbsDown, Building2, Calendar, Mail, Bell,
} from 'lucide-react';
import { useAppStore, type CustomerNotification } from '@/store';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import AmountSplitPanel from '@/components/business/AmountSplitPanel';
import ApprovalFlow from '@/components/business/ApprovalFlow';
import DifferenceAlert from '@/components/business/DifferenceAlert';
import RefundVoucher from '@/components/business/RefundVoucher';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';
import { calculateAmountSplit, calculatePerformanceDeduction, checkPackageDifference, type RefundItemInput } from '@/utils/calculator';
import type { OrderItem, PerformanceRole, RefundMethod } from '@/types';
import clsx from 'clsx';

const roleIcon: Record<PerformanceRole, typeof Stethoscope> = {
  '医生': Stethoscope,
  '咨询师': User,
  '渠道': Network,
};

const roleColor: Record<PerformanceRole, string> = {
  '医生': 'from-primary-400 to-primary-600 text-primary-700 bg-primary-50 border-primary-100',
  '咨询师': 'from-medical-400 to-medical-600 text-medical-700 bg-medical-50 border-medical-100',
  '渠道': 'from-warning-400 to-warning-600 text-warning-700 bg-warning-50 border-warning-100',
};

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    applications, handlingFeeRules, updateApplication, submitForReview,
    approveNode, rejectNode, registerRefund, currentUser,
    sendCustomerNotification, getNotificationsByCustomerId,
  } = useAppStore();

  const app = applications.find((a) => a.id === id);
  const [editable, setEditable] = useState(app?.status === '草稿' || app?.status === '财务退回' || app?.status === '店长驳回');
  const [refundItems, setRefundItems] = useState<Map<string, number>>(
    new Map(app?.originalOrder.items.map((i) => [i.id, i.refundCount || 0]) || [])
  );
  const [differenceReason, setDifferenceReason] = useState(app?.differenceReason || '');
  const [remark, setRemark] = useState(app?.remark || '');
  const [approveModal, setApproveModal] = useState<{ show: boolean; type: 'approve' | 'reject' } | null>(null);
  const [approveOpinion, setApproveOpinion] = useState('');
  const [refundMethod, setRefundMethod] = useState<RefundMethod | null>(app?.refundMethod || null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [notifyTemplate, setNotifyTemplate] = useState<CustomerNotification['templateType']>('refund_confirm');
  const [notifyChannel, setNotifyChannel] = useState<CustomerNotification['channel']>('短信');

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-neutral-400" />
        </div>
        <p className="text-lg font-semibold text-neutral-700 mb-2">未找到该申请记录</p>
        <p className="text-sm text-neutral-500 mb-6">申请编号可能已被删除或不存在</p>
        <Link to="/applications" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> 返回申请列表
        </Link>
      </div>
    );
  }

  const order = app.originalOrder;

  const refundItemInputs: RefundItemInput[] = order.items
    .filter((item) => (refundItems.get(item.id) || 0) > 0)
    .map((item) => ({ itemId: item.id, refundCount: refundItems.get(item.id) || 0 }));

  const calc = calculateAmountSplit(order, refundItemInputs, handlingFeeRules);
  const hasDifference = checkPackageDifference(order, refundItemInputs);
  const performanceCalc = calculatePerformanceDeduction(app.id, order, calc.itemSplits);

  const handleRefundCountChange = (itemId: string, count: number) => {
    const item = order.items.find((i) => i.id === itemId);
    if (!item) return;
    const max = item.remainingCount;
    const clamped = Math.max(0, Math.min(max, count));
    const newMap = new Map(refundItems);
    newMap.set(itemId, clamped);
    setRefundItems(newMap);
  };

  const validateRefund = (): { ok: boolean; msg?: string } => {
    const totalRefund = refundItemInputs.reduce((s, r) => s + r.refundCount, 0);
    if (totalRefund === 0) {
      return { ok: false, msg: '请至少选择一个退项项目' };
    }
    if (hasDifference && !differenceReason.trim()) {
      return { ok: false, msg: '检测到套餐拆项差异，请先填写差异原因说明' };
    }
    if (calc.totalActualRefund <= 0 && calc.totalCardDeduction <= 0 && calc.totalGiftDeduction <= 0 && calc.totalDebtDeduction <= 0) {
      return { ok: false, msg: '退款金额不能为0，请先设置退项项目' };
    }
    if (app.finalRefund !== undefined && calc.finalRefund < 0) {
      return { ok: false, msg: '实退金额计算异常，请重新调整退项' };
    }
    return { ok: true };
  };

  const handleSave = (): boolean => {
    const v = validateRefund();
    if (!v.ok) {
      alert(`核算校验未通过：${v.msg}`);
      return false;
    }

    const updatedItems: OrderItem[] = order.items.map((item) => ({
      ...item,
      refundCount: refundItems.get(item.id) || 0,
    }));

    updateApplication(app.id, {
      originalOrder: { ...order, items: updatedItems },
      actualRefund: calc.totalActualRefund,
      cardDeduction: calc.totalCardDeduction,
      giftDeduction: calc.totalGiftDeduction,
      debtDeduction: calc.totalDebtDeduction,
      handlingFee: calc.handlingFee,
      finalRefund: calc.finalRefund,
      itemSplits: calc.itemSplits,
      performanceDeductions: performanceCalc,
      hasDifference,
      differenceReason: differenceReason || undefined,
      remark: remark || undefined,
    }, '手动保存核算数据');

    setEditable(false);
    return true;
  };

  const handleSubmitReview = () => {
    const v = validateRefund();
    if (!v.ok) {
      alert(`提交校验未通过：${v.msg}\n\n请先完成核算并保存后再提交财务复核。`);
      return;
    }
    const saved = handleSave();
    if (!saved) return;
    submitForReview(app.id);
    setEditable(false);
  };

  const handleApprove = () => {
    if (!approveModal) return;
    const nodeIdx = app.currentNode;
    if (approveModal.type === 'approve') {
      approveNode(app.id, nodeIdx, approveOpinion || '同意');
    } else {
      if (!approveOpinion.trim()) {
        alert('退回时必须填写原因');
        return;
      }
      rejectNode(app.id, nodeIdx, approveOpinion);
      setEditable(app.status === '财务退回' || app.status === '店长驳回');
    }
    setApproveModal(null);
    setApproveOpinion('');
  };

  const handleRegisterRefund = () => {
    if (!refundMethod) {
      alert('请选择退款方式');
      return;
    }
    registerRefund(app.id, refundMethod);
  };

  const canEdit = ['草稿', '财务退回', '店长驳回'].includes(app.status);
  const canApprove = (currentUser.role === '财务主管' && app.status === '待财务复核')
    || (currentUser.role === '门店店长' && app.status === '待店长审批');
  const canRegister = (currentUser.role === '前台顾问' || currentUser.role === '财务主管' || currentUser.role === '门店店长')
    && app.status === '待到账登记';

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-neutral-900">退款核算详情</h1>
              <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">{app.applicationNo}</span>
              <StatusBadge status={app.status} />
              {app.hasDifference && <span className="badge badge-difference">含拆项差异</span>}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              创建于 {formatDateTime(app.createdAt)} · {app.applicantName} · {app.storeName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button onClick={handleSave} className="btn-secondary">
                <Save className="w-4 h-4" />
                保存草稿
              </button>
              <button onClick={handleSubmitReview} className="btn-primary">
                <Send className="w-4 h-4" />
                提交财务复核
              </button>
            </>
          )}
          {canApprove && (
            <>
              <button
                onClick={() => { setApproveModal({ show: true, type: 'reject' }); setApproveOpinion(''); }}
                className="btn-danger"
              >
                <ThumbsDown className="w-4 h-4" />
                退回
              </button>
              <button
                onClick={() => { setApproveModal({ show: true, type: 'approve' }); setApproveOpinion(''); }}
                className="btn-success"
              >
                <ThumbsUp className="w-4 h-4" />
                审批通过
              </button>
            </>
          )}
          {canRegister && (
            <button onClick={handleRegisterRefund} className="btn-medical" disabled={!refundMethod}>
              <Check className="w-4 h-4" />
              确认到账并完成
            </button>
          )}
          <button onClick={() => setShowVoucher(true)} className="btn-secondary">
            <Printer className="w-4 h-4" />
            打印
          </button>
          <button onClick={() => setShowVoucher(true)} className="btn-secondary">
            <Download className="w-4 h-4" />
            导出凭证
          </button>
        </div>
      </div>

      <ApprovalFlow nodes={app.approvalFlow} currentNode={app.currentNode} />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <CustomerInfoCard customer={app.customer} />

          <div className="card p-5">
            <h3 className="section-title">
              <span className="w-1 h-5 rounded bg-primary-600" />
              原订单信息
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">订单编号</p>
                <p className="text-sm font-mono font-semibold text-neutral-800">{order.orderNo}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">下单时间</p>
                <p className="text-sm text-neutral-700">{formatDateTime(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">支付方式</p>
                <p className="text-sm text-neutral-700">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">所属门店</p>
                <div className="flex items-center gap-1 text-sm text-neutral-700">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  {order.storeName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 p-3 bg-gradient-to-r from-primary-50 via-medical-50 to-warning-50 rounded-lg border border-neutral-100 mb-4">
              <div>
                <p className="text-[11px] text-neutral-500 mb-0.5">订单总价</p>
                <p className="text-base font-bold font-mono text-neutral-800">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-primary-600 mb-0.5 flex items-center gap-1"><Wallet className="w-3 h-3" /> 实收金额</p>
                <p className="text-base font-bold font-mono text-primary-700">{formatCurrency(order.actualAmount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-medical-600 mb-0.5 flex items-center gap-1"><CreditCard className="w-3 h-3" /> 耗卡抵扣</p>
                <p className="text-base font-bold font-mono text-medical-700">{formatCurrency(order.cardDeduction)}</p>
              </div>
              <div>
                <p className="text-[11px] text-warning-600 mb-0.5 flex items-center gap-1"><Package className="w-3 h-3" /> 赠送抵扣</p>
                <p className="text-base font-bold font-mono text-warning-700">{formatCurrency(order.giftAmount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-danger-600 mb-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 客户欠款</p>
                <p className="text-base font-bold font-mono text-danger-700">{formatCurrency(order.debtAmount)}</p>
              </div>
            </div>

            <h4 className="section-subtitle mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-500" />
              项目核销表（勾选退项项目）
            </h4>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>项目名称</th>
                    <th className="text-center">类型</th>
                    <th className="text-right">单价</th>
                    <th className="text-center">总次数</th>
                    <th className="text-center">已做</th>
                    <th className="text-center">剩余</th>
                    <th className="text-center w-28">退项次数</th>
                    <th className="text-right">退项金额</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const refundCount = refundItems.get(item.id) || 0;
                    const refundAmount = item.unitPrice * refundCount;
                    return (
                      <tr key={item.id} className={refundCount > 0 ? 'table-row-active' : ''}>
                        <td className="font-medium text-neutral-800">
                          <div className="flex flex-col">
                            <span>{item.projectName}</span>
                            {(item.doctorName || item.consultantName) && (
                              <span className="text-[10px] text-neutral-400 mt-0.5">
                                {item.doctorName && `医生:${item.doctorName}`}
                                {item.doctorName && item.consultantName && ' · '}
                                {item.consultantName && `咨询:${item.consultantName}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={clsx(
                            'badge',
                            item.type === 'normal' && 'bg-primary-50 text-primary-700 border-primary-100',
                            item.type === 'gift' && 'bg-warning-50 text-warning-700 border-warning-100',
                            item.type === 'package' && 'bg-medical-50 text-medical-700 border-medical-100',
                          )}>
                            {item.type === 'normal' ? '正常' : item.type === 'gift' ? '赠送' : '套餐'}
                          </span>
                        </td>
                        <td className="text-right amount text-neutral-700">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-center">{item.totalCount}</td>
                        <td className="text-center text-success-700 font-medium">{item.usedCount}</td>
                        <td className="text-center text-primary-700 font-semibold">{item.remainingCount}</td>
                        <td className="text-center">
                          {canEdit ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleRefundCountChange(item.id, refundCount - 1)}
                                disabled={refundCount <= 0}
                                className="w-6 h-6 rounded border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                              >
                                <MinusCircle className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={item.remainingCount}
                                value={refundCount}
                                onChange={(e) => handleRefundCountChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-14 h-7 text-center text-sm rounded border border-neutral-200 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                              />
                              <button
                                onClick={() => handleRefundCountChange(item.id, refundCount + 1)}
                                disabled={refundCount >= item.remainingCount}
                                className="w-6 h-6 rounded border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className={clsx('font-semibold', refundCount > 0 ? 'text-danger-700' : 'text-neutral-400')}>
                              {refundCount}
                            </span>
                          )}
                        </td>
                        <td className={clsx('text-right amount font-semibold', refundAmount > 0 ? 'text-danger-700' : 'text-neutral-300')}>
                          {refundAmount > 0 ? formatCurrency(refundAmount) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {hasDifference && (
            <DifferenceAlert
              reason={differenceReason}
              onReasonChange={setDifferenceReason}
              editable={canEdit}
            />
          )}

          {app.hasDifference && !editable && !hasDifference && (
            <DifferenceAlert reason={app.differenceReason} editable={false} />
          )}

          <AmountSplitPanel application={{
            ...app,
            actualRefund: canEdit ? calc.totalActualRefund : app.actualRefund,
            cardDeduction: canEdit ? calc.totalCardDeduction : app.cardDeduction,
            giftDeduction: canEdit ? calc.totalGiftDeduction : app.giftDeduction,
            debtDeduction: canEdit ? calc.totalDebtDeduction : app.debtDeduction,
            handlingFee: canEdit ? calc.handlingFee : app.handlingFee,
            finalRefund: canEdit ? calc.finalRefund : app.finalRefund,
            itemSplits: canEdit && calc.itemSplits.length > 0 ? calc.itemSplits : app.itemSplits,
          }} />

          <div className="card p-5">
            <h3 className="section-title">
              <span className="w-1 h-5 rounded bg-warning-600" />
              业绩冲减明细
              <span className="ml-auto text-xs font-normal text-neutral-500">
                仅实收部分计入业绩冲减
              </span>
            </h3>

            {(canEdit && performanceCalc.length > 0 ? performanceCalc : app.performanceDeductions).length === 0 ? (
              <div className="py-10 text-center text-neutral-400">
                <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>暂未生成业绩冲减记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(['医生', '咨询师', '渠道'] as PerformanceRole[]).map((role) => {
                  const Icon = roleIcon[role];
                  const list = (canEdit && performanceCalc.length > 0 ? performanceCalc : app.performanceDeductions)
                    .filter((p) => p.role === role);
                  if (list.length === 0) return null;
                  return (
                    <div key={role}>
                      <div className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border mb-2 bg-gradient-to-r',
                        roleColor[role],
                      )}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{role}业绩冲减</span>
                        <span className="ml-auto text-xs font-medium opacity-80">{list.length} 人</span>
                      </div>
                      <div className="table-wrapper !border-l-4">
                        <table className="table !border-l-4">
                          <thead>
                            <tr>
                              <th>姓名</th>
                              <th className="text-right">原业绩</th>
                              <th className="text-right">冲减金额</th>
                              <th className="text-right">冲减后业绩</th>
                              <th className="text-center w-32">冲减比例</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((p) => {
                              const ratio = p.originalPerformance > 0 ? p.deductionAmount / p.originalPerformance * 100 : 0;
                              return (
                                <tr key={p.id}>
                                  <td className="font-medium text-neutral-800">{p.personName}</td>
                                  <td className="text-right amount text-neutral-600">{formatCurrency(p.originalPerformance)}</td>
                                  <td className="text-right amount-lg text-danger-700 font-semibold">-{formatCurrency(p.deductionAmount)}</td>
                                  <td className="text-right amount-lg text-success-700 font-semibold">{formatCurrency(p.afterPerformance)}</td>
                                  <td className="text-center">
                                    <div className="w-full flex items-center gap-2">
                                      <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-danger-400 to-danger-600 rounded-full"
                                          style={{ width: `${Math.min(100, ratio)}%` }}
                                        />
                                      </div>
                                      <span className="text-[11px] font-mono text-neutral-600 flex-shrink-0 w-12 text-right">
                                        {formatNumber(ratio, 1)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {canRegister && (
            <div className="card p-5 border-2 border-medical-200 bg-gradient-to-br from-medical-50/50 to-white">
              <h3 className="section-title">
                <span className="w-1 h-5 rounded bg-medical-600" />
                登记退款方式
                <span className="badge badge-pending ml-2">待完成</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(['原路退回', '转余额', '抵扣新单'] as RefundMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setRefundMethod(m)}
                    className={clsx(
                      'p-4 rounded-lg border-2 text-left transition-all',
                      refundMethod === m
                        ? 'border-medical-500 bg-medical-50 shadow-md'
                        : 'border-neutral-200 hover:border-medical-300 hover:bg-medical-50/40',
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        refundMethod === m ? 'bg-medical-500 text-white' : 'bg-neutral-100 text-neutral-500',
                      )}>
                        {m === '原路退回' && <Wallet className="w-4 h-4" />}
                        {m === '转余额' && <CreditCard className="w-4 h-4" />}
                        {m === '抵扣新单' && <TrendingDown className="w-4 h-4" />}
                      </span>
                      {refundMethod === m && <Check className="w-5 h-5 text-medical-600" />}
                    </div>
                    <p className={clsx('font-semibold', refundMethod === m ? 'text-medical-800' : 'text-neutral-800')}>{m}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {m === '原路退回' && '退回至原支付账户'}
                      {m === '转余额' && '转入客户储值卡余额'}
                      {m === '抵扣新单' && '直接抵扣新消费订单'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <div className="card p-5">
              <h3 className="section-title">
                <span className="w-1 h-5 rounded bg-neutral-500" />
                备注说明
              </h3>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                placeholder="可选：填写本次退款的其他补充说明、备注事项..."
                className="input resize-none"
              />
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-5">
          <div className="card p-5 sticky top-6">
            <h3 className="section-title">
              <MessageSquare className="w-4 h-4 text-neutral-500" />
              审批意见汇总
            </h3>
            <div className="space-y-3">
              {app.approvalFlow.filter((n) => n.opinion).map((n, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                    n.status === 'approved' && 'bg-success-500',
                    n.status === 'rejected' && 'bg-danger-500',
                    !['approved', 'rejected'].includes(n.status) && 'bg-neutral-400',
                  )}>
                    {n.approverName?.charAt(0) || '审'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-800">{n.approverName}</span>
                      <span className="text-[10px] text-neutral-400">{n.nodeName}</span>
                      {n.status === 'approved' && <Check className="w-3 h-3 text-success-600" />}
                      {n.status === 'rejected' && <X className="w-3 h-3 text-danger-600" />}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{formatDateTime(n.operatedAt!)}</p>
                    <div className={clsx(
                      'mt-1.5 p-2.5 rounded-lg text-sm',
                      n.status === 'approved' ? 'bg-success-50 text-success-800 border border-success-100' : 'bg-danger-50 text-danger-800 border border-danger-100',
                    )}>
                      {n.opinion}
                    </div>
                  </div>
                </div>
              ))}
              {app.approvalFlow.filter((n) => n.opinion).length === 0 && (
                <div className="py-6 text-center text-neutral-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>暂无审批意见</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title">
              <Bell className="w-4 h-4 text-primary-600" />
              客户通知
              <span className="ml-auto text-[10px] font-normal text-neutral-400">
                共发送 {getNotificationsByCustomerId(app.customerId).filter(n => n.applicationId === app.id).length} 条
              </span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">通知模板</label>
                <select
                  value={notifyTemplate}
                  onChange={(e) => setNotifyTemplate(e.target.value as any)}
                  className="w-full h-9 text-sm rounded border border-neutral-200 px-2 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="refund_confirm">退款确认单</option>
                  <option value="refund_success">到账提醒</option>
                  <option value="refund_reject">审批退回通知</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">发送渠道</label>
                <div className="flex gap-2">
                  {(['短信', '站内信', '邮件'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setNotifyChannel(c)}
                      className={clsx(
                        'flex-1 h-8 rounded border text-xs transition-all',
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
                  customerId: app.customerId,
                  templateType: notifyTemplate,
                  applicationId: app.id,
                  channel: notifyChannel,
                })}
                className="btn-medical w-full !py-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                立即发送客户通知
              </button>

              <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-2 font-medium">发送历史</p>
                {(() => {
                  const list = getNotificationsByCustomerId(app.customerId).filter(n => n.applicationId === app.id).slice(0, 8);
                  if (list.length === 0) {
                    return <p className="text-xs text-neutral-300 text-center py-3">暂无发送记录</p>;
                  }
                  return (
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {list.map(n => (
                        <div key={n.id} className="p-2 rounded-lg border border-neutral-100 bg-neutral-50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                              {n.templateName}
                            </span>
                            <span className="text-[10px] text-neutral-400">{n.channel}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 mt-1.5 leading-relaxed line-clamp-2">{n.content}</p>
                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-neutral-200/60">
                            <span className="text-[10px] text-neutral-400">{formatDateTime(n.sentAt)}</span>
                            <span className="text-[10px] text-neutral-400">{n.sentBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {app.remark && !canEdit && (
            <div className="card p-5">
              <h3 className="section-title">
                <FileText className="w-4 h-4 text-neutral-500" />
                申请备注
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                {app.remark}
              </p>
            </div>
          )}
        </div>
      </div>

      {approveModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-modal w-[480px] overflow-hidden animate-slide-up">
            <div className={clsx(
              'px-5 py-4 flex items-center gap-3',
              approveModal.type === 'approve' ? 'bg-success-500' : 'bg-danger-500',
            )}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                {approveModal.type === 'approve' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
              </div>
              <div className="text-white">
                <h3 className="text-lg font-bold">{approveModal.type === 'approve' ? '审批通过' : '退回申请'}</h3>
                <p className="text-xs text-white/80">
                  当前节点：{app.approvalFlow[app.currentNode]?.nodeName}
                </p>
              </div>
            </div>
            <div className="p-5">
              <label className="label">
                审批意见
                {approveModal.type === 'reject' && <span className="text-danger-600 ml-1">*</span>}
              </label>
              <textarea
                value={approveOpinion}
                onChange={(e) => setApproveOpinion(e.target.value)}
                rows={4}
                placeholder={approveModal.type === 'approve'
                  ? '请输入审批意见（可选，如：核算无误，同意退款）'
                  : '请详细说明退回原因，便于申请人修正'
                }
                className="input resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2 bg-neutral-50">
              <button onClick={() => setApproveModal(null)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleApprove}
                className={approveModal.type === 'approve' ? 'btn-success' : 'btn-danger'}
              >
                {approveModal.type === 'approve' ? '确认通过' : '确认退回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVoucher && (
        <RefundVoucher
          application={app}
          mode="preview"
          onClose={() => setShowVoucher(false)}
        />
      )}
    </div>
  );
};

export default ApplicationDetail;
