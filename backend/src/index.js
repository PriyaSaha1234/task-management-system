import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy backend/.env.example to backend/.env and fill it in.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((url) => url.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Unknown routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Errors thrown in any route end up here (Express 5 forwards async errors automatically)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: status === 500 ? 'Something went wrong' : err.message });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
