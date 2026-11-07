import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const STATUSES = ['PENDING', 'COMPLETED'];

// Every task route needs a logged in USER
router.use(authenticate, authorize('USER'));

// Finds a task that belongs to the logged in user, or sends 404
async function findOwnTask(req, res) {
  const id = Number(req.params.id);
  const task = Number.isInteger(id)
    ? await prisma.task.findFirst({ where: { id, userId: req.user.id } })
    : null;
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return null;
  }
  return task;
}

// GET /api/tasks?status=PENDING|COMPLETED
router.get('/', async (req, res) => {
  const where = { userId: req.user.id };
  if (STATUSES.includes(req.query.status)) where.status = req.query.status;

  const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ tasks });
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  const task = await findOwnTask(req, res);
  if (task) res.json({ task });
});

// POST /api/tasks
router.post('/', async (req, res) => {
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim() || null;
  const status = STATUSES.includes(req.body?.status) ? req.body.status : 'PENDING';

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const task = await prisma.task.create({
    data: { title, description, status, userId: req.user.id },
  });
  res.status(201).json({ task });
});

// PUT /api/tasks/:id - edit title, description and/or status
router.put('/:id', async (req, res) => {
  const existing = await findOwnTask(req, res);
  if (!existing) return;

  const body = req.body || {};
  const data = {};
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return res.status(400).json({ message: 'Title cannot be empty' });
    data.title = title;
  }
  if (body.description !== undefined) {
    data.description = String(body.description ?? '').trim() || null;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return res.status(400).json({ message: 'Status must be PENDING or COMPLETED' });
    }
    data.status = body.status;
  }

  const task = await prisma.task.update({ where: { id: existing.id }, data });
  res.json({ task });
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  const existing = await findOwnTask(req, res);
  if (!existing) return;

  await prisma.task.delete({ where: { id: existing.id } });
  res.json({ message: 'Task deleted' });
});

export default router;
