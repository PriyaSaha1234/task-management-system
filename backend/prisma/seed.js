// Creates (or updates) the initial admin account.
// Run with: npm run seed
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@taskmanager.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set in backend/.env');
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role: 'ADMIN' },
    create: { name, email, password: hashed, role: 'ADMIN' },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
