import { useState } from 'react';

// Modal form used for both creating and editing a task.
// Pass `task` to edit an existing one, or leave it empty to create.
export default function TaskFormModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'PENDING');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ title, description, status });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="card w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900">{task ? 'Edit task' : 'New task'}</h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="label" htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish the project report"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="input min-h-28 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details…"
            />
          </div>

          <div>
            <label className="label" htmlFor="status">Status</label>
            <select
              id="status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
