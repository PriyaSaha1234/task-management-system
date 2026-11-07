import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Every admin route needs a logged in ADMIN
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/stats - numbers for the dashboard cards
router.get('/stats', async (req, res) => {
  const [totalUsers, totalTasks, completedTasks, recentUsers, recentTasks] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  res.json({
    stats: {
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
    },
    recentUsers,
    recentTasks,
  });
});

// GET /api/admin/users - all registered users with their task counts
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { tasks: true } },
    },
  });
  res.json({ users });
});

// DELETE /api/admin/users/:id - deletes the user and (via cascade) their tasks
router.delete('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = Number.isInteger(id) ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'ADMIN') {
    return res.status(400).json({ message: 'Admin accounts cannot be deleted here' });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
});

// GET /api/admin/tasks - every task with its owner
router.get('/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ tasks });
});

// DELETE /api/admin/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const task = Number.isInteger(id) ? await prisma.task.findUnique({ where: { id } }) : null;
  if (!task) return res.status(404).json({ message: 'Task not found' });

  await prisma.task.delete({ where: { id } });
  res.json({ message: 'Task deleted' });
});

export default router;
