import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import useApiError from '../hooks/useApiError.js';
import PageHeader from '../components/PageHeader.jsx';
import StatusBadge, { formatDate } from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const handleError = useApiError(setError);

  useEffect(() => {
    api('/admin/stats').then(setData).catch(handleError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading dashboard…</p>;

  const { stats, recentUsers, recentTasks } = data;
  const completionRate = stats.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const cards = [
    { label: 'Registered users', value: stats.totalUsers, accent: 'bg-indigo-500' },
    { label: 'Total tasks', value: stats.totalTasks, accent: 'bg-sky-500' },
    { label: 'Pending tasks', value: stats.pendingTasks, accent: 'bg-amber-500' },
    { label: 'Completed tasks', value: stats.completedTasks, accent: 'bg-emerald-500' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="An overview of everything happening in TaskFlow." />

      {/* Statistics cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card relative overflow-hidden p-5">
            <span className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      <div className="card mt-4 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Overall completion</span>
          <span className="font-semibold text-slate-900">{completionRate}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Recent users */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Newest users</h2>
            <Link to="/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No users have registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent tasks */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Latest tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No tasks have been created yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                    <p className="truncate text-xs text-slate-500">by {t.user.name}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
