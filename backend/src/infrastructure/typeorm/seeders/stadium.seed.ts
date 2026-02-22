import { DataSource } from 'typeorm';
import { StadiumEntity } from '../entities/stadium.entity';

const stadiumsData = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
    name: 'バンテリンドーム ナゴヤ',
  },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002', name: '神宮球場' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003', name: '甲子園球場' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567004', name: '東京ドーム' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567005', name: '横浜スタジアム' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567006', name: 'マツダスタジアム' },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567007',
    name: '楽天モバイルパーク宮城',
  },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567008', name: 'PayPayドーム' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567009', name: '京セラドーム大阪' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567010', name: 'ZOZOマリンスタジアム' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567011', name: 'ベルーナドーム' },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567012',
    name: 'エスコンフィールド北海道',
  },
];

export async function seedStadiums(dataSource: DataSource): Promise<void> {
  console.log('Seeding stadiums...');

  const repository = dataSource.getRepository(StadiumEntity);

  const now = new Date();

  for (const stadium of stadiumsData) {
    await repository
      .createQueryBuilder()
      .insert()
      .into(StadiumEntity)
      .values({ ...stadium, createdAt: now, updatedAt: now })
      .orUpdate(['name', 'updated_at'], ['id'])
      .execute();
    console.log(`Upserted stadium: ${stadium.name}`);
  }

  console.log('Stadiums seeding finished.');
}
