import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
