import { PrismaClient } from '@prisma/client';

const stadiumsData = [
  {
    name: 'バンテリンドーム ナゴヤ',
    isDefault: true,
  },
  {
    name: '神宮球場',
    isDefault: false,
  },
  {
    name: '甲子園球場',
    isDefault: false,
  },
  {
    name: '東京ドーム',
    isDefault: false,
  },
  {
    name: '横浜スタジアム',
    isDefault: false,
  },
  {
    name: 'マツダスタジアム',
    isDefault: false,
  },
  {
    name: '楽天モバイルパーク宮城',
    isDefault: false,
  },
  {
    name: 'PayPayドーム',
    isDefault: false,
  },
  {
    name: '京セラドーム大阪',
    isDefault: false,
  },
  {
    name: 'ZOZOマリンスタジアム',
    isDefault: false,
  },
  {
    name: 'ベルーナドーム',
    isDefault: false,
  },
  {
    name: 'エスコンフィールド北海道',
    isDefault: false,
  },
];

export async function seedStadiums(prisma: PrismaClient): Promise<void> {
  console.log('Seeding stadiums...');

  for (const stadiumData of stadiumsData) {
    const stadium = await prisma.stadium.upsert({
      where: { name: stadiumData.name },
      update: {},
      create: stadiumData,
    });
    console.log(
      `Created stadium: ${stadium.name} (default: ${stadium.isDefault})`,
    );
  }

  console.log('Stadiums seeding finished.');
}
