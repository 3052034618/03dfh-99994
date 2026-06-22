import { useRef } from 'react';
import type { RefundApplication } from '@/types';
import { formatCurrency, formatDateTime, formatPhone } from '@/utils/format';
import { Printer, Download, X, Building2, Calendar } from 'lucide-react';

interface RefundVoucherProps {
  application: RefundApplication;
  mode: 'preview' | 'print';
  onClose?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
}

const RefundVoucher = ({ application, mode = 'preview', onClose, onPrint, onExport }: RefundVoucherProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = contentRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=850,height=650');
    if (!printWindow) return;
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>退款明细单 - ${application.applicationNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, "Microsoft YaHei", sans-serif; padding: 32px 40px; color: #1f2937; font-size: 13px; }
    .header { border-bottom: 2px solid #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
    .header h1 { color: #1e3a5f; font-size: 22px; font-weight: 700; }
    .header .sub { color: #6b7280; margin-top: 6px; font-size: 12px; }
    .row { display: flex; gap: 32px; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
    .row .label { width: 90px; color: #6b7280; flex-shrink: 0; }
    .row .val { color: #111827; font-weight: 500; word-break: break-all; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px 8px; text-align: left; border: 1px solid #e5e7eb; font-size: 12px; }
    th { background: #f8fafc; color: #1e3a5f; font-weight: 600; }
    .total-row td { font-weight: 600; background: #fafafa; }
    .amount { text-align: right; font-family: 'Segoe UI', monospace; }
    .section-title { font-size: 15px; font-weight: 700; color: #1e3a5f; margin: 24px 0 10px; padding-left: 10px; border-left: 4px solid #0d9488; }
    .summary-box { background: linear-gradient(135deg, #1e3a5f 0%, #2d4e78 100%); color: white; padding: 18px 20px; margin-top: 12px; border-radius: 8px; }
    .summary-box .label { color: rgba(255,255,255,0.7); font-size: 12px; }
    .summary-box .big { font-size: 28px; font-weight: 700; margin-top: 4px; font-family: 'Segoe UI', monospace; }
    .summary-box .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 12px; }
    .summary-box .item .num { font-size: 16px; font-weight: 600; margin-top: 2px; font-family: 'Segoe UI', monospace; }
    .approval-list { margin-top: 10px; }
    .approval-item { display: flex; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; align-items: center; }
    .approval-node { width: 72px; height: 28px; line-height: 28px; text-align: center; border-radius: 14px; background: #0d9488; color: white; font-size: 12px; margin-right: 16px; flex-shrink: 0; }
    .approval-node.pending { background: #e5e7eb; color: #6b7280; }
    .approval-node.rejected { background: #dc2626; }
    .approval-info { flex: 1; }
    .approval-info .t1 { color: #111827; font-weight: 500; }
    .approval-info .t2 { color: #6b7280; font-size: 11px; margin-top: 2px; }
    .sign-area { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 48px; }
    .sign-box { text-align: center; color: #6b7280; font-size: 12px; padding-top: 14px; border-top: 1px solid #9ca3af; }
    .foot { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
${content.outerHTML}
<script>window.onload = function() { setTimeout(() => { window.print(); }, 300); }</script>
</body>
</html>
    `);
    printWindow.document.close();
    onPrint?.();
  };

  const handleExport = () => {
    const content = contentRef.current;
    if (!content) return;
    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>退款明细单-${application.applicationNo}</title>
<style>
  body { font-family: -apple-system, "Microsoft YaHei", sans-serif; padding: 24px; color: #1f2937; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
  th { background: #f8fafc; }
  .title { color: #1e3a5f; font-size: 20px; font-weight: 700; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 16px; }
  .row { padding: 6px 0; border-bottom: 1px dashed #e5e7eb; display: flex; }
  .row b { width: 100px; font-weight: normal; color: #6b7280; }
  .sum { background: #1e3a5f; color: white; padding: 14px; border-radius: 6px; margin: 12px 0; }
  .sum .big { font-size: 24px; font-weight: 700; font-family: 'Segoe UI', monospace; }
</style></head><body>${content.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `退款明细单_${application.applicationNo}_${formatDateTime(application.updatedAt).replace(/[\\/:]/g, '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  const app = application;
  const customer = app.customer;
  const order = app.originalOrder;

  return (
    <div className={mode === 'preview' ? 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in' : ''}>
      <div className={mode === 'preview' ? 'bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl' : 'max-w-4xl mx-auto'}>
        {mode === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div>
              <h2 className="text-lg font-bold text-primary-700">退款明细单 - {app.applicationNo}</h2>
              <p className="text-sm text-neutral-500 mt-0.5">可打印给客户签字确认或导出HTML留存</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExport} className="btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-lg">
                <Download className="w-4 h-4" /> 导出HTML
              </button>
              <button onClick={handlePrint} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg">
                <Printer className="w-4 h-4" /> 打印
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className={mode === 'preview' ? 'overflow-y-auto flex-1 px-10 py-8 bg-neutral-50' : 'bg-white'}>
          <div ref={contentRef} style={mode === 'preview' ? { background: 'white', padding: '32px 40px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } : {}}>
            <div className="header" style={{ borderBottom: '2px solid #1e3a5f', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ color: '#1e3a5f', fontSize: '22px', fontWeight: 700 }}>医美项目退款明细单</h1>
                <span style={{ fontSize: '12px', color: '#9ca3af', background: '#f3f4f6', padding: '4px 10px', borderRadius: '4px' }}>
                  {app.applicationNo}
                </span>
              </div>
              <div className="sub" style={{ color: '#6b7280', marginTop: '6px', fontSize: '12px', display: 'flex', gap: '20px' }}>
                <span className="flex items-center gap-1"><Building2 style={{ width: '12px', height: '12px' }} /> {app.storeName}</span>
                <span className="flex items-center gap-1"><Calendar style={{ width: '12px', height: '12px' }} /> 开单日期：{formatDateTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="section-title" style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a5f', margin: '20px 0 10px', paddingLeft: '10px', borderLeft: '4px solid #0d9488' }}>
              客户信息
            </div>
            <div className="row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              <div className="row" style={{ display: 'flex', gap: '32px', marginBottom: '8px', padding: '8px 0', borderBottom: '1px dashed #e5e7eb' }}>
                <span className="label" style={{ width: '90px', color: '#6b7280' }}>客户姓名</span>
                <span className="val" style={{ color: '#111827', fontWeight: 500 }}>{customer.name}</span>
              </div>
              <div className="row"><span className="label">会员等级</span><span className="val">{customer.memberLevel}会员</span></div>
              <div className="row"><span className="label">联系电话</span><span className="val">{formatPhone(customer.phone)}</span>
              </div>
              <div className="row"><span className="label">累计消费</span><span className="val">{formatCurrency(customer.totalSpent)}（退款{customer.refundCount}次）</span></div>
            </div>

            <div className="section-title">原订单信息</div>
            <div className="row-2">
              <div className="row"><span className="label">原订单号</span><span className="val">{order.orderNo}</span></div>
              <div className="row"><span className="label">支付方式</span><span className="val">{order.paymentMethod}</span></div>
              <div className="row"><span className="label">订单总额</span><span className="val" style={{ color: '#1e3a5f' }}>{formatCurrency(order.totalAmount)}</span></div>
              <div className="row"><span className="label">咨询师</span><span className="val">{order.consultantName || '-'}</span></div>
              <div className="row"><span className="label">实收金额</span><span className="val">{formatCurrency(order.actualAmount)}</span></div>
              <div className="row"><span className="label">耗卡金额</span><span className="val">{formatCurrency(order.cardDeduction)}</span></div>
              <div className="row"><span className="label">赠送金额</span><span className="val">{formatCurrency(order.giftAmount)}</span></div>
              <div className="row"><span className="label">欠款金额</span><span className="val">{formatCurrency(order.debtAmount)}</span></div>
            </div>

            <div className="section-title">退项项目明细</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>项目名称</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>类型</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>原价</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>总次数</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>已做</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>剩余</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>退项</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>退项金额</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => {
                  const split = app.itemSplits.find(s => s.itemId === it.id);
                  const refundCount = split ? Math.round(split.refundAmount / it.unitPrice) : 0;
                  return (
                    <tr key={it.id}>
                      <td style={{ textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                      <td>{it.projectName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '3px', background: it.type === 'package' ? '#fef3c7' : '#ecfdf5', color: it.type === 'package' ? '#92400e' : '#065f46' }}>
                          {it.type === 'package' ? '套餐' : '单项'}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(it.unitPrice)}</td>
                      <td style={{ textAlign: 'center' }}>{it.totalCount}</td>
                      <td style={{ textAlign: 'center' }}>{it.usedCount}</td>
                      <td style={{ textAlign: 'center' }}>{it.remainingCount}</td>
                      <td style={{ textAlign: 'center', fontWeight: refundCount > 0 ? 600 : 400, color: refundCount > 0 ? '#dc2626' : '#6b7280' }}>
                        {refundCount || '-'}
                      </td>
                      <td className="amount" style={{ color: refundCount > 0 ? '#dc2626' : '#6b7280', fontWeight: refundCount > 0 ? 600 : 400 }}>
                        {refundCount > 0 ? formatCurrency(split!.refundAmount) : '-'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td colSpan={8} style={{ textAlign: 'right' }}>退项金额合计</td>
                  <td className="amount" style={{ color: '#dc2626' }}>{formatCurrency(app.actualRefund + app.cardDeduction + app.giftDeduction + app.debtDeduction)}</td>
                </tr>
              </tbody>
            </table>

            <div className="section-title">金额拆分核算</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>项目</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>实收部分</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>耗卡部分</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>赠送部分</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>欠款部分</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>合计</th>
                </tr>
              </thead>
              <tbody>
                {app.itemSplits.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>暂无退项数据</td></tr>
                )}
                {app.itemSplits.map((s, idx) => (
                  <tr key={s.itemId}>
                    <td style={{ textAlign: 'center', color: '#6b7280' }}>{idx + 1}</td>
                    <td>{s.projectName}</td>
                    <td className="amount">{formatCurrency(s.actualPortion)}</td>
                    <td className="amount">{formatCurrency(s.cardPortion)}</td>
                    <td className="amount">{formatCurrency(s.giftPortion)}</td>
                    <td className="amount">{formatCurrency(s.debtPortion)}</td>
                    <td className="amount" style={{ fontWeight: 500 }}>{formatCurrency(s.refundAmount)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={2} style={{ textAlign: 'right' }}>合计</td>
                  <td className="amount" style={{ color: '#1e3a5f' }}>{formatCurrency(app.actualRefund)}</td>
                  <td className="amount">{formatCurrency(app.cardDeduction)}</td>
                  <td className="amount">{formatCurrency(app.giftDeduction)}</td>
                  <td className="amount">{formatCurrency(app.debtDeduction)}</td>
                  <td className="amount">{formatCurrency(app.actualRefund + app.cardDeduction + app.giftDeduction + app.debtDeduction)}</td>
                </tr>
              </tbody>
            </table>

            <div className="summary-box" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4e78 100%)', color: 'white', padding: '18px 20px', marginTop: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>实退金额（客户到账）</div>
                  <div className="big" style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', fontFamily: "'Segoe UI', monospace" }}>
                    ¥ {formatCurrency(app.finalRefund)}
                  </div>
                </div>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '12px', width: '55%' }}>
                  <div className="item">
                    <div className="label">手续费</div>
                    <div className="num" style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px', fontFamily: "'Segoe UI', monospace" }}>¥ {formatCurrency(app.handlingFee)}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>支付方式：{order.paymentMethod}</div>
                  </div>
                  <div className="item">
                    <div className="label">退款方式</div>
                    <div className="num">{app.refundMethod || '待登记'}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                      {app.relatedNewOrderId ? `新单：${app.relatedNewOrderId}` : '原路退回原账户'}
                    </div>
                  </div>
                  <div className="item">
                    <div className="label">申请状态</div>
                    <div className="num">{app.status}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                      {app.completedAt ? `完成：${formatDateTime(app.completedAt)}` : '待处理'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {app.differenceReason && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', color: '#92400e', fontSize: '12px' }}>
                <b>拆项差异说明：</b>{app.differenceReason}
              </div>
            )}

            <div className="section-title">审批流程记录</div>
            <div className="approval-list">
              {app.approvalFlow.map((n) => (
                <div key={n.id} className="approval-item" style={{ display: 'flex', padding: '10px 0', borderBottom: '1px dashed #e5e7eb', alignItems: 'center' }}>
                  <div className={`approval-node ${n.status}`} style={{
                    width: '72px', height: '28px', lineHeight: '28px', textAlign: 'center', borderRadius: '14px',
                    background: n.status === 'approved' ? '#0d9488' : n.status === 'rejected' ? '#dc2626' : '#e5e7eb',
                    color: n.status === 'pending' ? '#6b7280' : 'white', fontSize: '12px', marginRight: '16px', flexShrink: 0
                  }}>
                    {n.status === 'approved' ? '已通过' : n.status === 'rejected' ? '已退回' : '待处理'}
                  </div>
                  <div className="approval-info" style={{ flex: 1 }}>
                    <div className="t1" style={{ color: '#111827', fontWeight: 500 }}>
                      {n.nodeName} - {n.approverRole}{n.approverName ? ` · ${n.approverName}` : ''}
                    </div>
                    <div className="t2" style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                      {n.operatedAt ? `操作时间：${formatDateTime(n.operatedAt)}` : '等待处理'}
                      {n.opinion ? ` · 意见：${n.opinion}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sign-area" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '48px' }}>
              <div className="sign-box" style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', paddingTop: '14px', borderTop: '1px solid #9ca3af' }}>
                客户签字确认：
              </div>
              <div className="sign-box">门店经办人签字：</div>
              <div className="sign-box">财务审核签字：</div>
            </div>

            <div className="foot" style={{ textAlign: 'center', color: '#9ca3af', fontSize: '11px', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              本单一式三联，客户、门店、财务各留存一份。如有疑问请致电 400-XXX-XXXX。生成时间：{formatDateTime(new Date().toISOString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundVoucher;
