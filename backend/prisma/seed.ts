import { PrismaClient } from '@prisma/client';
import { seedStadiums } from './seeders/stadium.seed';
import { seedGames } from './seeders/game.seed';
import { seedAdminUser } from './seeders/admin-user.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const isProduction = process.env.NODE_ENV === 'production';

  await seedStadiums(prisma);
  await seedAdminUser(prisma);

  if (!isProduction) {
    await seedGames(prisma);
  } else {
    console.log('Skipping games seeding in production environment.');
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
