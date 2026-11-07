import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start organizing your work in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required className="input"
            value={form.name} onChange={update} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input"
            value={form.email} onChange={update} placeholder="you@example.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="input"
              value={form.password} onChange={update} placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" required className="input"
              value={form.confirm} onChange={update} placeholder="Repeat password" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
