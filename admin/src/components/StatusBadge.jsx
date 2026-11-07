export default function StatusBadge({ status }) {
  const done = status === 'COMPLETED';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {done ? 'Completed' : 'Pending'}
    </span>
  );
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
