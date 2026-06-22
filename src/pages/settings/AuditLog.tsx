import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils/format';
import { Search, Calendar, ArrowLeft, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const AuditLog = () => {
  const { auditLogs } = useAppStore();
  const [filter, setFilter] = useState({ user: '', action: '', start: '', end: '' });

  const filtered = auditLogs.filter((log) => {
    if (filter.user && !log.userName.includes(filter.user)) return false;
    if (filter.action && !log.action.includes(filter.action)) return false;
    if (filter.start && log.createdAt < filter.start) return false;
    if (filter.end && log.createdAt > filter.end + ' 23:59:59') return false;
    return true;
  });

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
          <p className="text-sm text-neutral-500 mt-0.5">完整的系统操作审计记录</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-4 gap-3 mb-4">
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
              <option value="">全部</option>
              <option>创建申请</option>
              <option>提交审批</option>
              <option>审批通过</option>
              <option>审批退回</option>
              <option>登记到账</option>
              <option>修改配置</option>
              <option>登录系统</option>
            </select>
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

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>操作人</th>
                <th>角色</th>
                <th>操作类型</th>
                <th>对象类型</th>
                <th>对象ID</th>
                <th>操作详情</th>
                <th>IP地址</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-neutral-500 w-40">{formatDateTime(log.createdAt)}</td>
                  <td className="font-semibold text-neutral-800">{log.userName}</td>
                  <td>
                    <span className={clsx(
                      'badge text-[10px]',
                      log.userRole === '财务主管' && 'bg-warning-50 text-warning-700 border-warning-200',
                      log.userRole === '门店店长' && 'bg-medical-50 text-medical-700 border-medical-200',
                      log.userRole === '前台顾问' && 'bg-primary-50 text-primary-700 border-primary-200',
                    )}>
                      {log.userRole}
                    </span>
                  </td>
                  <td>
                    <span className={clsx(
                      'badge',
                      ['创建申请', '提交审批', '登录系统'].includes(log.action) && 'badge-draft',
                      ['审批通过', '登记到账', '修改配置'].includes(log.action) && 'badge-approved',
                      log.action === '审批退回' && 'badge-rejected',
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-sm">{log.targetType}</td>
                  <td className="font-mono text-xs text-neutral-500">{log.targetId}</td>
                  <td className="text-sm text-neutral-700">{log.detail}</td>
                  <td className="font-mono text-xs text-neutral-500">{log.ip || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
