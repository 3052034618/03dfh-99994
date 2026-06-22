import { Bell, Search, ChevronDown, LogOut, User, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { relativeTime } from '@/utils/format';

const Header = () => {
  const { notifications, removeNotification, currentUser } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索申请单号、客户姓名、手机号..."
            className="input pl-9 pr-4 py-2 bg-neutral-50 border-neutral-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="w-10 h-10 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors relative">
            <Bell className="w-5 h-5 text-neutral-600" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger-500" />
            )}
          </button>

          {notifications.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-modal border border-neutral-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-800">通知消息</h4>
                <span className="text-xs text-neutral-500">{notifications.length} 条</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 flex items-start gap-3 transition-colors group`}
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      n.type === 'success' ? 'bg-success-500' :
                      n.type === 'warning' ? 'bg-warning-500' :
                      n.type === 'error' ? 'bg-danger-500' : 'bg-primary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-700">{n.message}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{relativeTime(Date.now().toString())}</p>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-neutral-200" />

        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-neutral-50 px-2.5 py-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-xs font-bold text-white">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-neutral-800 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-500">{currentUser.role}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
