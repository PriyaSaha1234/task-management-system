import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { signToken, publicUser } from '../lib/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register - create a normal USER account
router.post('/register', async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: 'USER' },
  });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

// Shared login logic. Only accounts with `requiredRole` may log in.
async function login(req, res, requiredRole) {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.role !== requiredRole) {
    return res.status(403).json({
      message:
        requiredRole === 'ADMIN'
          ? 'Only admin accounts can sign in here'
          : 'Admin accounts must use the admin website',
    });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}

// POST /api/auth/login - user website login (USER role only)
router.post('/login', (req, res) => login(req, res, 'USER'));

// POST /api/auth/admin/login - admin website login (ADMIN role only)
router.post('/admin/login', (req, res) => login(req, res, 'ADMIN'));

// GET /api/auth/me - the currently logged in user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
