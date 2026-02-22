import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../data-source';
import { seedStadiums } from './stadium.seed';
import { seedAdminUser } from './admin-user.seed';

async function main() {
  console.log('Start seeding...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const options = createDataSourceOptions(databaseUrl);
  const dataSource = new DataSource(options);

  await dataSource.initialize();

  try {
    await seedStadiums(dataSource);
    await seedAdminUser(dataSource);
    console.log('Seeding finished.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
