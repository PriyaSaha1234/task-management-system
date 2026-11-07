import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Checks the "Authorization: Bearer <token>" header and loads the user
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    return res.status(401).json({ message: 'User no longer exists' });
  }
  req.user = user;
  next();
}

// Role-based access control: authorize('ADMIN') only lets admins through
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this' });
    }
    next();
  };
}
