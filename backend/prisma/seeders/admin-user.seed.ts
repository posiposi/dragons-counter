import {
  PrismaClient,
  UserRole,
  RegistrationStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  console.log('Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      'ADMIN_EMAIL or ADMIN_DEFAULT_PASSWORD is not set, skipping admin user seeding.',
    );
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      registrationRequests: {
        create: {
          status: RegistrationStatus.APPROVED,
        },
      },
    },
  });

  console.log(`Admin user created: ${adminEmail}`);
}
