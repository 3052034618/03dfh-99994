import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="text-[160px] font-black leading-none bg-gradient-to-r from-primary-400 via-medical-400 to-primary-600 bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary-100/50 blur-3xl -z-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">页面未找到</h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          您访问的页面可能已被移动、删除，或链接输入有误。
          请检查地址是否正确，或返回首页继续操作。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </Link>
          <Link to="/applications" className="btn-primary">
            <Home className="w-4 h-4" />
            回到申请列表
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
