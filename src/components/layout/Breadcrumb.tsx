import { ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const routes: Record<string, { label: string; parent?: string }> = {
  '/applications': { label: '申请列表' },
  '/applications/new': { label: '新建申请', parent: '/applications' },
  '/approvals': { label: '审批中心' },
  '/reports': { label: '报表看板' },
  '/customers': { label: '客户档案' },
  '/settings': { label: '系统设置' },
  '/settings/audit-log': { label: '操作日志', parent: '/settings' },
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const crumbs: { label: string; path: string; isLast: boolean }[] = [];
  crumbs.push({ label: '首页', path: '/', isLast: false });

  const parts = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < parts.length; i++) {
    currentPath += `/${parts[i]}`;
    const dynamicPath = currentPath.replace(/\/[a-z0-9]+$/gi, '/:id');
    const config = routes[currentPath] || routes[dynamicPath];
    if (config) {
      if (config.parent && !crumbs.find(c => c.path === config.parent)) {
        const parentConfig = routes[config.parent];
        if (parentConfig) {
          crumbs.push({ label: parentConfig.label, path: config.parent, isLast: false });
        }
      }
      const isLast = i === parts.length - 1;
      if (!crumbs.find(c => c.path === currentPath)) {
        crumbs.push({ label: config.label, path: currentPath, isLast });
      } else {
        const existing = crumbs.find(c => c.path === currentPath)!;
        existing.isLast = isLast;
      }
    }
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-5">
      {crumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />}
          {crumb.isLast ? (
            <span className="text-neutral-800 font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-primary-600 transition-colors inline-flex items-center gap-1"
            >
              {idx === 0 && <Home className="w-3.5 h-3.5" />}
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
