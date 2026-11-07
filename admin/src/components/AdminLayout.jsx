import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const icon = (d) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: icon('M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10') },
  { to: '/users', label: 'Users', icon: icon('M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM21 20v-2a4 4 0 00-3-3.87M16 2.13a4 4 0 010 7.75') },
  { to: '/tasks', label: 'Tasks', icon: icon('M9 11l3 3 8-8M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h9') },
];

// Page shell for every admin page: sidebar + top bar + page content
export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  }
  if (!admin) return <Navigate to="/login" replace />;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Dark overlay behind the sidebar on small screens */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-white">TaskFlow</span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs font-medium text-indigo-300">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">{admin.name}</p>
          <p className="truncate text-xs text-slate-400">{admin.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-red-600 hover:text-white"
          >
            {icon('M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9')}
            Logout
          </button>
        </div>
      </aside>

      {/* Top bar (mobile only) */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          {icon('M4 6h16M4 12h16M4 18h16')}
        </button>
        <span className="font-semibold text-slate-900">TaskFlow Admin</span>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
