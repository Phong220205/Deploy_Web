import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { AuditLogsPage } from './pages/dashboard/AuditLogsPage';
import { ContactsPage } from './pages/dashboard/ContactsPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProjectDetailAdminPage } from './pages/dashboard/ProjectDetailPage';
import { ProjectFormPage } from './pages/dashboard/ProjectFormPage';
import { ProjectsAdminPage } from './pages/dashboard/ProjectsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { SystemPage } from './pages/dashboard/SystemPage';
import { ContractsPage, CustomersPage, EmployeesPage, InvestorsPage, MaterialsPage, UsersPage } from './pages/dashboard/ResourcePages';
import { RolesPage } from './pages/dashboard/RolesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { HomePage } from './pages/public/HomePage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

const managerRoles = ['ADMIN', 'PROJECT_MANAGER'] as const;

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsAdminPage />} />
        <Route path="projects/create" element={<ProtectedRoute roles={[...managerRoles]}><ProjectFormPage /></ProtectedRoute>} />
        <Route path="projects/:id/edit" element={<ProtectedRoute roles={[...managerRoles]}><ProjectFormPage /></ProtectedRoute>} />
        <Route path="projects/:id" element={<ProjectDetailAdminPage />} />
        <Route path="customers" element={<ProtectedRoute roles={[...managerRoles]}><CustomersPage /></ProtectedRoute>} />
        <Route path="investors" element={<ProtectedRoute roles={[...managerRoles]}><InvestorsPage /></ProtectedRoute>} />
        <Route path="contracts" element={<ProtectedRoute roles={[...managerRoles]}><ContractsPage /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute roles={[...managerRoles]}><EmployeesPage /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute roles={[...managerRoles]}><MaterialsPage /></ProtectedRoute>} />
        <Route path="contacts" element={<ProtectedRoute roles={['ADMIN']}><ContactsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute roles={['ADMIN']}><RolesPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={[...managerRoles]}><ReportsPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
        <Route path="system" element={<ProtectedRoute roles={['ADMIN']}><SystemPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
