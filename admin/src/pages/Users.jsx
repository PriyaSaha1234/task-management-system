import { useEffect, useState } from 'react';
import { api } from '../api.js';
import useApiError from '../hooks/useApiError.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatDate } from '../components/StatusBadge.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const handleError = useApiError();

  useEffect(() => {
    api('/admin/users')
      .then((data) => setUsers(data.users))
      .catch(handleError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteUser(user) {
    const ok = window.confirm(
      `Delete ${user.name} (${user.email})?\nThis also deletes their ${user._count.tasks} task(s).`,
    );
    if (!ok) return;
    try {
      await api(`/admin/users/${user.id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((u) => u.id !== user.id));
    } catch (err) {
      handleError(err);
    }
  }

  const term = search.trim().toLowerCase();
  const visible = users.filter(
    (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
  );

  return (
    <>
      <PageHeader title="Users" subtitle={`${users.length} account(s) in the system`}>
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Tasks</th>
                <th className="table-th">Joined</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="table-td py-10 text-center text-slate-500">Loading users…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan="5" className="table-td py-10 text-center text-slate-500">No users found.</td></tr>
              ) : (
                visible.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="table-td">{u._count.tasks}</td>
                    <td className="table-td whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="table-td text-right">
                      {u.role === 'ADMIN' ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <button onClick={() => deleteUser(u)} className="btn-danger-ghost">Delete</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
