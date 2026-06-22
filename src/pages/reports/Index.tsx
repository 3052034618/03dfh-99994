import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, PieChart, Pie,
} from 'recharts';
import {
  Calendar, TrendingUp, BarChart3, Trophy, AlertTriangle,
  Building2, Download, ChevronDown, Award, Medal, Crown,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/business/StatCard';
import { formatCurrency, formatNumber } from '@/utils/format';
import clsx from 'clsx';

const timeRanges = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季度' },
  { key: 'custom', label: '自定义' },
];

const COLORS = ['#1e3a5f', '#0d9488', '#ea580c', '#dc2626', '#7c3aed'];

const Reports = () => {
  const { reportData, stores } = useAppStore();
  const [range, setRange] = useState('month');
  const data = reportData;

  const storeChartData = data.storeReports.map((s) => ({
    name: s.storeName.replace(/分院|旗舰院|中心院|精品院/g, '').slice(0, 6),
    退款单数: s.refundCount,
    退款金额: Math.round(s.refundAmount / 10000),
    业绩冲减: Math.round(s.performanceDeduction / 10000),
    fullName: s.storeName,
  }));

  const pieData = data.storeReports.map((s, idx) => ({
    name: s.storeName.replace(/分院|旗舰院|中心院|精品院/g, ''),
    value: s.refundAmount,
    color: COLORS[idx % COLORS.length],
  }));

  const rankMedals = [Crown, Trophy, Medal];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">数据报表看板</h1>
          <p className="text-sm text-neutral-500 mt-0.5">多维度统计退款核算数据，辅助经营决策</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {timeRanges.map((t) => (
              <button
                key={t.key}
                onClick={() => setRange(t.key)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  range === t.key
                    ? 'bg-white shadow-sm text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-700',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn-secondary">
            <Calendar className="w-4 h-4" />
            选择日期
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="btn-primary">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="退款总金额"
          value={formatCurrency(data.totalRefundAmount)}
          icon={TrendingUp}
          trend={-5.3}
          trendLabel="同比"
          color="primary"
          subtitle="实退金额合计"
        />
        <StatCard
          title="退款单数"
          value={data.totalRefundCount.toString()}
          icon={BarChart3}
          trend={12.4}
          trendLabel="环比"
          color="warning"
          subtitle="成功退款申请数"
        />
        <StatCard
          title="平均退款额"
          value={formatCurrency(data.avgRefundAmount)}
          icon={BarChart3}
          trend={-15.2}
          trendLabel="同比"
          color="primary"
          subtitle="单均实退金额"
        />
        <StatCard
          title="冲减业绩总额"
          value={formatCurrency(data.totalPerformanceDeduction)}
          icon={Trophy}
          trend={-8.7}
          trendLabel="同比"
          color="danger"
          subtitle="医生/咨询/渠道合计"
        />
        <StatCard
          title="拆项差异单数"
          value={data.differenceCount.toString()}
          icon={AlertTriangle}
          color="warning"
          subtitle="需重点关注异常单"
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title !mb-0">
              <span className="w-1 h-5 rounded bg-primary-600" />
              各门店退款对比
              <span className="text-xs font-normal text-neutral-400 ml-2">
                金额单位：万元
              </span>
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary-600" />
                退款单数
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-medical-500" />
                退款金额
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-warning-500" />
                业绩冲减
              </span>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: any, name) => {
                    if (name === '退款单数') return [value + ' 单', name];
                    return [formatCurrency(value * 10000), name];
                  }}
                  labelFormatter={(l, p: any) => p?.[0]?.payload?.fullName || l}
                />
                <Bar dataKey="退款单数" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="退款金额" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="业绩冲减" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">
            <span className="w-1 h-5 rounded bg-medical-600" />
            门店退款占比
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: any) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {pieData.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
                  <span className="text-neutral-600">{p.name}</span>
                </div>
                <span className="font-mono font-semibold text-neutral-800">
                  {formatNumber(p.value / data.totalRefundAmount * 100, 1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title !mb-0">
              <span className="w-1 h-5 rounded bg-warning-500" />
              近30天退款趋势
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-8 h-0.5 bg-primary-600" />
                退款金额
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-warning-500" />
                退款单数
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#cbd5e1' }} interval={3} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: any, name: string) => {
                    if (name === 'refundAmount' || name === '退款金额') return [formatCurrency(value), '退款金额'];
                    return [value + ' 单', '退款单数'];
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="refundAmount"
                  name="退款金额"
                  stroke="#1e3a5f"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#1e3a5f', stroke: 'white', strokeWidth: 2 }}
                  fill="url(#colorAmount)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="refundCount"
                  name="退款单数"
                  stroke="#ea580c"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#ea580c', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">
            <span className="w-1 h-5 rounded bg-danger-500" />
            顾问业绩冲减排行
          </h3>
          <div className="space-y-2.5">
            {data.consultantRankings.slice(0, 8).map((c, idx) => {
              const MedalIcon = idx < 3 ? rankMedals[idx] : Award;
              const medalColors = ['text-amber-500', 'text-slate-400', 'text-orange-400'];
              return (
                <div
                  key={idx}
                  className={clsx(
                    'rounded-lg p-3 border transition-all hover:shadow-md',
                    idx === 0 && 'bg-gradient-to-r from-amber-50 to-white border-amber-200',
                    idx === 1 && 'bg-gradient-to-r from-slate-50 to-white border-slate-200',
                    idx === 2 && 'bg-gradient-to-r from-orange-50 to-white border-orange-200',
                    idx > 2 && 'bg-white border-neutral-200',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      idx < 3 ? 'bg-white shadow-sm' : 'bg-neutral-100',
                    )}>
                      {idx < 3 ? (
                        <MedalIcon className={clsx('w-5 h-5', medalColors[idx])} />
                      ) : (
                        <span className="text-sm font-bold text-neutral-500">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-neutral-800 truncate">{c.consultantName}</p>
                        <p className="text-[11px] text-neutral-400">{c.storeName.slice(0, 4)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-danger-600 flex items-center gap-1">
                          冲减 <span className="font-mono font-semibold">{formatCurrency(c.performanceDeduction)}</span>
                        </p>
                        <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {c.refundCount}单 · {formatCurrency(c.refundAmount, 0)}
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-100 mt-2 overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            idx === 0 && 'bg-gradient-to-r from-amber-400 to-amber-500',
                            idx === 1 && 'bg-gradient-to-r from-slate-400 to-slate-500',
                            idx === 2 && 'bg-gradient-to-r from-orange-400 to-orange-500',
                            idx > 2 && 'bg-gradient-to-r from-primary-400 to-primary-500',
                          )}
                          style={{
                            width: `${(c.performanceDeduction / data.consultantRankings[0].performanceDeduction * 100).toFixed(0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-4">
          <span className="w-1 h-5 rounded bg-primary-600" />
          门店汇总明细
        </h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>门店名称</th>
                <th className="text-center">城市</th>
                <th className="text-right">退款单数</th>
                <th className="text-right">退款总金额</th>
                <th className="text-right">业绩冲减</th>
                <th className="text-right">占比</th>
                <th className="text-right">单均退款</th>
                <th className="text-center">差异单数</th>
                <th className="text-center">异常率</th>
              </tr>
            </thead>
            <tbody>
              {data.storeReports.map((s) => {
                const ratio = s.refundAmount / data.totalRefundAmount * 100;
                const diffRate = s.differenceCount / s.refundCount * 100;
                return (
                  <tr key={s.storeId}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary-600" />
                        <span className="font-semibold text-neutral-800">{s.storeName}</span>
                      </div>
                    </td>
                    <td className="text-center text-neutral-600">{stores.find((st) => st.id === s.storeId)?.city || '-'}</td>
                    <td className="text-right font-semibold text-neutral-800">{s.refundCount}</td>
                    <td className="text-right amount-lg text-primary-700 font-semibold">{formatCurrency(s.refundAmount)}</td>
                    <td className="text-right amount text-danger-700">{formatCurrency(s.performanceDeduction)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-neutral-600 w-12 text-right">
                          {formatNumber(ratio, 1)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right amount text-neutral-700">{formatCurrency(s.refundAmount / s.refundCount)}</td>
                    <td className="text-center">
                      <span className={clsx(
                        'badge',
                        s.differenceCount > 0 ? 'badge-difference' : 'badge-approved',
                      )}>
                        {s.differenceCount}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={clsx(
                        'text-sm font-semibold',
                        diffRate > 15 ? 'text-danger-700' : diffRate > 8 ? 'text-warning-700' : 'text-success-700',
                      )}>
                        {formatNumber(diffRate, 1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-neutral-50 font-semibold">
                <td className="text-neutral-900">合计</td>
                <td className="text-center">-</td>
                <td className="text-right text-neutral-900">{data.totalRefundCount}</td>
                <td className="text-right amount-xl text-primary-800">{formatCurrency(data.totalRefundAmount)}</td>
                <td className="text-right amount-lg text-danger-800">{formatCurrency(data.totalPerformanceDeduction)}</td>
                <td className="text-right text-neutral-900">100%</td>
                <td className="text-right amount text-neutral-900">{formatCurrency(data.avgRefundAmount)}</td>
                <td className="text-center text-neutral-900">{data.differenceCount}</td>
                <td className="text-center text-neutral-900">
                  {formatNumber(data.differenceCount / data.totalRefundCount * 100, 1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
