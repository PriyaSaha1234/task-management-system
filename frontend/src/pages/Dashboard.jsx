import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  // null = closed, {} = create new, a task object = edit that task
  const [editing, setEditing] = useState(null);

  // If the token expired, send the user back to the login page
  function handleError(err) {
    if (err.status === 401) {
      logout();
      navigate('/login');
    } else {
      setError(err.message);
    }
  }

  useEffect(() => {
    api('/tasks')
      .then((data) => setTasks(data.tasks))
      .catch(handleError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveTask(values) {
    if (editing?.id) {
      const data = await api(`/tasks/${editing.id}`, { method: 'PUT', body: values });
      setTasks((list) => list.map((t) => (t.id === data.task.id ? data.task : t)));
    } else {
      const data = await api('/tasks', { method: 'POST', body: values });
      setTasks((list) => [data.task, ...list]);
    }
    setEditing(null);
  }

  async function toggleStatus(task) {
    const status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const data = await api(`/tasks/${task.id}`, { method: 'PUT', body: { status } });
      setTasks((list) => list.map((t) => (t.id === task.id ? data.task : t)));
    } catch (err) {
      handleError(err);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE' });
      setTasks((list) => list.filter((t) => t.id !== task.id));
    } catch (err) {
      handleError(err);
    }
  }

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const stats = [
    { label: 'Total tasks', value: tasks.length, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Pending', value: tasks.length - completed, color: 'bg-amber-50 text-amber-700' },
    { label: 'Completed', value: completed, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const visibleTasks = tasks.filter(
    (t) =>
      (filter === 'ALL' || t.status === filter) &&
      t.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Hello, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">Here&apos;s an overview of your tasks.</p>
          </div>
          <button onClick={() => setEditing({})} className="btn-primary">
            <span className="text-lg leading-none">+</span> New task
          </button>
        </div>

        {/* Statistics cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900">
                {s.value}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.color}`}>
                  {s.label === 'Completed' && tasks.length
                    ? `${Math.round((completed / tasks.length) * 100)}%`
                    : s.label.split(' ')[0]}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Filters and search */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            className="input sm:max-w-xs"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {/* Task list */}
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="py-12 text-center text-slate-500">Loading tasks…</p>
          ) : visibleTasks.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <p className="font-medium text-slate-900">No tasks found</p>
              <p className="mt-1 text-sm text-slate-500">
                {tasks.length === 0
                  ? 'Create your first task to get started.'
                  : 'Try a different filter or search.'}
              </p>
            </div>
          ) : (
            visibleTasks.map((task) => {
              const done = task.status === 'COMPLETED';
              return (
                <div key={task.id} className="card flex items-start gap-4 p-4 sm:p-5">
                  <button
                    onClick={() => toggleStatus(task)}
                    title={done ? 'Mark as pending' : 'Mark as completed'}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {done && (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {done ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{task.description}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">Created {formatDate(task.createdAt)}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setEditing(task)} className="btn-secondary px-3 py-1.5">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task)}
                      className="btn px-3 py-1.5 text-red-600 hover:bg-red-50 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {editing && (
        <TaskFormModal
          task={editing.id ? editing : null}
          onSave={saveTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
