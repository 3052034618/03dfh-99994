import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, ShoppingBag, CheckCircle, Search, ChevronRight,
  User, Phone, Badge, Building2, Calendar, ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import CustomerInfoCard from '@/components/business/CustomerInfoCard';
import { formatCurrency, formatDateTime, formatPhone } from '@/utils/format';
import clsx from 'clsx';

const steps = [
  { id: 1, name: '选择客户', icon: Users },
  { id: 2, name: '选择原订单', icon: ShoppingBag },
  { id: 3, name: '提交申请', icon: CheckCircle },
];

const ApplicationNew = () => {
  const navigate = useNavigate();
  const { customers, getOrdersByCustomerId, createApplication } = useAppStore();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const kw = search.toLowerCase();
    return c.name.toLowerCase().includes(kw) || c.phone.includes(kw);
  });

  const customerOrders = selectedCustomerId ? getOrdersByCustomerId(selectedCustomerId) : [];
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedOrder = customerOrders.find((o) => o.id === selectedOrderId);

  const handleCreate = () => {
    if (!selectedCustomer || !selectedOrder) return;
    const newApp = createApplication({
      customerId: selectedCustomer.id,
      customer: selectedCustomer,
      originalOrderId: selectedOrder.id,
      originalOrder: selectedOrder,
      storeId: selectedOrder.storeId,
      storeName: selectedOrder.storeName,
    });
    navigate(`/applications/${newApp.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/applications" className="btn-ghost !p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">新建退款申请</h1>
          <p className="text-sm text-neutral-500 mt-0.5">三步快速创建退款申请，系统自动完成金额核算</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 first:flex-initial">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    done && 'bg-success-500 text-white shadow-md shadow-success-200',
                    active && 'bg-primary-600 text-white shadow-md shadow-primary-200',
                    !done && !active && 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200',
                  )}>
                    {done ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={clsx(
                      'text-xs font-medium',
                      (active || done) ? 'text-primary-700' : 'text-neutral-400',
                    )}>
                      步骤 {s.id}
                    </p>
                    <p className={clsx(
                      'text-base font-bold',
                      active ? 'text-neutral-900' : done ? 'text-success-700' : 'text-neutral-400',
                    )}>
                      {s.name}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={clsx(
                    'flex-1 h-1 mx-6 rounded-full transition-all',
                    done ? 'bg-success-300' : 'bg-neutral-100',
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-neutral-900">选择退款客户</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索客户姓名或手机号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={clsx(
                  'p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4',
                  selectedCustomerId === c.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <CustomerInfoCard customer={c} compact />
                </div>
                <div className={clsx(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all',
                  selectedCustomerId === c.id
                    ? 'bg-primary-600 text-white'
                    : 'border-2 border-neutral-300',
                )}>
                  {selectedCustomerId === c.id && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={() => selectedCustomerId && setStep(2)}
              disabled={!selectedCustomerId}
              className="btn-primary"
            >
              下一步：选择订单
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedCustomer && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <CustomerInfoCard customer={selectedCustomer} />
              <button onClick={() => setStep(1)} className="btn-ghost">
                <ArrowLeft className="w-4 h-4" />
                重新选择客户
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-5">选择要退款的原订单</h2>

            {customerOrders.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">该客户暂无历史订单</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => {
                  const remaining = order.items.reduce((s, i) => s + i.remainingCount, 0);
                  const selected = selectedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={clsx(
                        'rounded-xl border-2 p-5 cursor-pointer transition-all',
                        selected
                          ? 'border-primary-500 bg-primary-50/50 shadow-md'
                          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono text-sm font-bold text-primary-700 bg-primary-100 px-2.5 py-1 rounded">
                              {order.orderNo}
                            </span>
                            <span className="text-sm text-neutral-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateTime(order.createdAt)}
                            </span>
                            <span className="text-sm text-neutral-500 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {order.storeName}
                            </span>
                            <span className="badge bg-medical-50 text-medical-700 border-medical-200">
                              {order.paymentMethod}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-3 mb-3">
                            <div>
                              <p className="text-[11px] text-neutral-400 mb-0.5">订单总额</p>
                              <p className="font-bold font-mono text-neutral-800">{formatCurrency(order.totalAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-primary-600 mb-0.5">实收金额</p>
                              <p className="font-bold font-mono text-primary-700">{formatCurrency(order.actualAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-medical-600 mb-0.5">耗卡抵扣</p>
                              <p className="font-bold font-mono text-medical-700">{formatCurrency(order.cardDeduction)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-warning-600 mb-0.5">赠送金额</p>
                              <p className="font-bold font-mono text-warning-700">{formatCurrency(order.giftAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-danger-600 mb-0.5">剩余可退</p>
                              <p className="font-bold font-mono text-danger-700">{remaining} 次项目</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 5).map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1 text-xs bg-white border border-neutral-200 px-2.5 py-1 rounded-full"
                              >
                                {item.projectName}
                                <span className="text-neutral-400">·</span>
                                <span className="text-primary-600 font-medium">
                                  {item.remainingCount}/{item.totalCount}次
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={clsx(
                          'w-6 h-6 rounded-full flex items-center justify-center ml-4 flex-shrink-0 mt-2 transition-all',
                          selected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'border-2 border-neutral-300',
                        )}>
                          {selected && <CheckCircle className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-5 mt-6 border-t border-neutral-100">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" />
                上一步
              </button>
              <button
                onClick={() => selectedOrderId && setStep(3)}
                disabled={!selectedOrderId}
                className="btn-primary"
              >
                下一步：创建申请
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedCustomer && selectedOrder && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-6 border-2 border-success-200 bg-gradient-to-br from-success-50/50 to-white">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-success-500 flex items-center justify-center shadow-lg shadow-success-200">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">即将创建退款申请</h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  确认以下信息无误后，点击「创建申请」进入详细核算页面
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  客户信息
                </p>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-neutral-500">姓名：</span><span className="font-semibold text-neutral-800">{selectedCustomer.name}</span></p>
                  <p><span className="text-neutral-500">电话：</span><span className="font-mono text-neutral-700">{formatPhone(selectedCustomer.phone)}</span></p>
                  <p><span className="text-neutral-500">会员：</span><span className="text-neutral-700">{selectedCustomer.memberLevel}会员</span></p>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 border border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  原订单信息
                </p>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-neutral-500">单号：</span><span className="font-mono font-semibold text-primary-700">{selectedOrder.orderNo}</span></p>
                  <p><span className="text-neutral-500">金额：</span><span className="font-mono font-semibold text-neutral-800">{formatCurrency(selectedOrder.totalAmount)}</span></p>
                  <p><span className="text-neutral-500">门店：</span><span className="text-neutral-700">{selectedOrder.storeName}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
            <div className="flex gap-2">
              <Link to="/applications" className="btn-ghost">
                取消
              </Link>
              <button onClick={handleCreate} className="btn-primary !px-6">
                <ArrowRight className="w-4 h-4" />
                创建申请并进入核算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationNew;
