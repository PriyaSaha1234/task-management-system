import { useEffect, useState } from 'react';
import { api } from '../api.js';
import useApiError from '../hooks/useApiError.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge, { formatDate } from '../components/StatusBadge.jsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const handleError = useApiError();

  useEffect(() => {
    api('/admin/tasks')
      .then((data) => setTasks(data.tasks))
      .catch(handleError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteTask(task) {
    if (!window.confirm(`Delete the task "${task.title}"?`)) return;
    try {
      await api(`/admin/tasks/${task.id}`, { method: 'DELETE' });
      setTasks((list) => list.filter((t) => t.id !== task.id));
    } catch (err) {
      handleError(err);
    }
  }

  const term = search.trim().toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (status === 'ALL' || t.status === status) &&
      (t.title.toLowerCase().includes(term) ||
        t.user.name.toLowerCase().includes(term) ||
        t.user.email.toLowerCase().includes(term)),
  );

  return (
    <>
      <PageHeader title="Tasks" subtitle={`${tasks.length} task(s) across all users`}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <input
            className="input sm:w-64"
            placeholder="Search title or owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-th">Task</th>
                <th className="table-th">Owner</th>
                <th className="table-th">Status</th>
                <th className="table-th">Created</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="table-td py-10 text-center text-slate-500">Loading tasks…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan="5" className="table-td py-10 text-center text-slate-500">No tasks found.</td></tr>
              ) : (
                visible.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="table-td max-w-xs">
                      <p className="truncate font-medium text-slate-900">{t.title}</p>
                      {t.description && <p className="truncate text-xs text-slate-500">{t.description}</p>}
                    </td>
                    <td className="table-td">
                      <p className="text-slate-900">{t.user.name}</p>
                      <p className="text-xs text-slate-500">{t.user.email}</p>
                    </td>
                    <td className="table-td"><StatusBadge status={t.status} /></td>
                    <td className="table-td whitespace-nowrap">{formatDate(t.createdAt)}</td>
                    <td className="table-td text-right">
                      <button onClick={() => deleteTask(t)} className="btn-danger-ghost">Delete</button>
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
