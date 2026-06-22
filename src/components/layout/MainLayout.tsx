import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 animate-fade-in">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
