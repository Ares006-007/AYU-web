import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, FileText, CreditCard,
  BarChart3, LogOut, ClipboardList, Bell
} from 'lucide-react';

const navItems = [
  { to: '/queue', icon: LayoutDashboard, label: 'Live Queue' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'HB';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏥 AYU</h1>
          <p>{user?.hospitalName || 'Hospital Dashboard'}</p>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section">Operations</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="icon" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
