import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Tasks from './pages/Tasks.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* AdminLayout checks that an admin is logged in and renders the sidebar */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
