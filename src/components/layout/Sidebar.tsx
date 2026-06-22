import type { LucideIcon } from 'lucide-react';
import { FileText, CheckSquare, BarChart3, Users, Settings, LayoutDashboard, X } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingCount = useAppStore((s) => s.getPendingApprovals().length);
  const currentUser = useAppStore((s) => s.currentUser);

  const navItems: NavItem[] = [
    { path: '/applications', label: '申请列表', icon: FileText },
    { path: '/approvals', label: '审批中心', icon: CheckSquare, badge: pendingCount },
    { path: '/reports', label: '报表看板', icon: BarChart3 },
    { path: '/customers', label: '客户档案', icon: Users },
    { path: '/settings', label: '系统设置', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-primary-600 to-primary-800 text-white flex flex-col fixed left-0 top-0 shadow-xl z-40">
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur">
            <LayoutDashboard className="w-5 h-5 text-medical-300" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">医美退款核算</h1>
            <p className="text-[10px] text-white/50 leading-tight">Refund Workbench</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item group ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                  active ? 'bg-white text-primary-700' : 'bg-warning-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-sm font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-[10px] text-white/60">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-full text-xs text-white/70 hover:text-white py-1.5 rounded hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
          >
            <Settings className="w-3 h-3" />
            个人设置
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
