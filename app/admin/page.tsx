import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminAuth } from '@/components/auth/AdminAuth';

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}