import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ApplicationList from '@/pages/applications/List';
import ApplicationDetail from '@/pages/applications/Detail';
import ApplicationNew from '@/pages/applications/New';
import ApprovalCenter from '@/pages/approvals/Index';
import Reports from '@/pages/reports/Index';
import CustomerList from '@/pages/customers/List';
import CustomerDetail from '@/pages/customers/Detail';
import Settings from '@/pages/settings/Index';
import AuditLog from '@/pages/settings/AuditLog';
import NotFound from '@/pages/NotFound';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/applications" replace />} />
          <Route path="applications" element={<ApplicationList />} />
          <Route path="applications/new" element={<ApplicationNew />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="approvals" element={<ApprovalCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/audit-log" element={<AuditLog />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
