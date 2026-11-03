import { useEffect, useState, type ComponentType } from 'react';
import {
  Boxes, Building2, ChartNoAxesCombined, ChevronDown, ClipboardList, FileBarChart, FileText,
  FolderKanban, Gauge, Handshake, HardHat, LogOut, Menu, PackageOpen, PanelLeftClose,
  ScrollText, Server, ShieldCheck, UserRoundCog, UsersRound, X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem { to: string; label: string; icon: ComponentType<{ size?: number }>; roles?: string[] }
const items: MenuItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: Gauge },
  { to: '/dashboard/projects', label: 'Dự án', icon: FolderKanban },
  { to: '/dashboard/customers', label: 'Khách hàng', icon: UsersRound, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/investors', label: 'Chủ đầu tư', icon: Handshake, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/contracts', label: 'Hợp đồng', icon: FileText, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/employees', label: 'Nhân sự', icon: HardHat, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/materials', label: 'Vật tư', icon: PackageOpen, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/contacts', label: 'Liên hệ', icon: ClipboardList, roles: ['ADMIN'] },
  { to: '/dashboard/users', label: 'Người dùng', icon: UserRoundCog, roles: ['ADMIN'] },
  { to: '/dashboard/roles', label: 'Vai trò', icon: ShieldCheck, roles: ['ADMIN'] },
  { to: '/dashboard/reports', label: 'Báo cáo', icon: FileBarChart, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { to: '/dashboard/audit-logs', label: 'Nhật ký', icon: ScrollText, roles: ['ADMIN'] },
  { to: '/dashboard/system', label: 'Hệ thống', icon: Server, roles: ['ADMIN'] },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan hệ thống', '/dashboard/projects': 'Quản lý dự án',
  '/dashboard/customers': 'Quản lý khách hàng', '/dashboard/investors': 'Quản lý chủ đầu tư',
  '/dashboard/contracts': 'Quản lý hợp đồng', '/dashboard/employees': 'Quản lý nhân sự',
  '/dashboard/materials': 'Quản lý vật tư', '/dashboard/contacts': 'Yêu cầu liên hệ',
  '/dashboard/users': 'Quản lý người dùng', '/dashboard/roles': 'Vai trò & phân quyền',
  '/dashboard/reports': 'Xuất báo cáo & tài liệu', '/dashboard/audit-logs': 'Nhật ký thao tác',
  '/dashboard/system': 'Thông tin hệ thống',
};

export function DashboardLayout() {
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setDrawer(false), [location.pathname]);
  const visibleItems = items.filter((item) => !item.roles || item.roles.includes(user?.role_name || ''));
  const currentTitle = pageTitles[location.pathname] || (location.pathname.includes('/projects/') ? 'Chi tiết dự án' : 'HDHOME Management');

  async function handleLogout() { await logout(); navigate('/login'); }
  return (
    <div className={`dashboard-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {drawer && <button className="drawer-scrim" aria-label="Đóng sidebar" onClick={() => setDrawer(false)} />}
      <aside className={`dashboard-sidebar ${drawer ? 'is-open' : ''}`}>
        <Link to="/" className="sidebar-brand"><span><Building2 /></span><div><strong>HDHOME</strong><small>PROJECT SYSTEM</small></div></Link>
        <button className="drawer-close" aria-label="Đóng menu" onClick={() => setDrawer(false)}><X /></button>
        <div className="sidebar-caption">QUẢN LÝ NỘI BỘ</div>
        <nav className="sidebar-nav" aria-label="Điều hướng quản trị">
          {visibleItems.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} title={item.label}><item.icon size={20} /><span>{item.label}</span></NavLink>)}
        </nav>
        <div className="sidebar-project-note"><Boxes /><div><strong>HDHOME PMS</strong><span>Phiên bản báo cáo thực tập</span></div></div>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}><PanelLeftClose size={18} /><span>{collapsed ? 'Mở rộng' : 'Thu gọn'}</span></button>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div><button className="mobile-sidebar-button" onClick={() => setDrawer(true)} aria-label="Mở sidebar"><Menu /></button><div><span>HỆ THỐNG QUẢN LÝ DỰ ÁN</span><strong>{currentTitle}</strong></div></div>
          <div className="topbar-account">
            <span className="avatar">{user?.full_name?.split(' ').slice(-1)[0]?.[0] || 'H'}</span>
            <div><strong>{user?.full_name}</strong><small>{user?.role_name}</small></div><ChevronDown size={16} />
            <button title="Đăng xuất" aria-label="Đăng xuất" onClick={handleLogout}><LogOut size={18} /></button>
          </div>
        </header>
        <main className="dashboard-content"><Outlet /></main>
        <footer className="dashboard-footer"><span>HDHOME Project Management System</span><span><ChartNoAxesCombined size={15} /> Dữ liệu minh họa</span></footer>
      </div>
    </div>
  );
}
