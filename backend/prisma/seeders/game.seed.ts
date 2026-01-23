import { PrismaClient } from '@prisma/client';

// Stadium IDs from stadium.seed.ts
const STADIUM_IDS = {
  VANTELIN: 'a1b2c3d4-e5f6-7890-abcd-ef1234567001',
  JINGU: 'a1b2c3d4-e5f6-7890-abcd-ef1234567002',
  KOSHIEN: 'a1b2c3d4-e5f6-7890-abcd-ef1234567003',
} as const;

const gamesData = [
  {
    gameDate: new Date('2024-04-01'),
    opponent: '巨人',
    dragonsScore: 5,
    opponentScore: 3,
    result: 'WIN' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '開幕戦！大野雄大の好投で勝利',
  },
  {
    gameDate: new Date('2024-04-02'),
    opponent: '巨人',
    dragonsScore: 2,
    opponentScore: 7,
    result: 'LOSE' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '打線が振るわず完敗',
  },
  {
    gameDate: new Date('2024-04-03'),
    opponent: '巨人',
    dragonsScore: 4,
    opponentScore: 4,
    result: 'DRAW' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '延長戦の末引き分け',
  },
  {
    gameDate: new Date('2024-04-05'),
    opponent: 'ヤクルト',
    dragonsScore: 8,
    opponentScore: 2,
    result: 'WIN' as const,
    stadiumId: STADIUM_IDS.JINGU,
    notes: '打線爆発!8得点の大勝',
  },
  {
    gameDate: new Date('2024-04-06'),
    opponent: 'ヤクルト',
    dragonsScore: 3,
    opponentScore: 5,
    result: 'LOSE' as const,
    stadiumId: STADIUM_IDS.JINGU,
    notes: '終盤の逆転負け',
  },
  {
    gameDate: new Date('2024-04-07'),
    opponent: 'ヤクルト',
    dragonsScore: 6,
    opponentScore: 0,
    result: 'WIN' as const,
    stadiumId: STADIUM_IDS.JINGU,
    notes: '投手陣の完封リレー',
  },
  {
    gameDate: new Date('2024-04-09'),
    opponent: '横浜',
    dragonsScore: 1,
    opponentScore: 3,
    result: 'LOSE' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '投手戦の末惜敗',
  },
  {
    gameDate: new Date('2024-04-10'),
    opponent: '横浜',
    dragonsScore: 7,
    opponentScore: 0,
    result: 'WIN' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '完封勝利！チーム一丸の勝利',
  },
  {
    gameDate: new Date('2024-04-11'),
    opponent: '横浜',
    dragonsScore: 2,
    opponentScore: 2,
    result: 'DRAW' as const,
    stadiumId: STADIUM_IDS.VANTELIN,
    notes: '雨天コールドで引き分け',
  },
  {
    gameDate: new Date('2024-04-13'),
    opponent: '阪神',
    dragonsScore: 4,
    opponentScore: 6,
    result: 'LOSE' as const,
    stadiumId: STADIUM_IDS.KOSHIEN,
    notes: '甲子園での熱戦も及ばず',
  },
];

export async function seedGames(prisma: PrismaClient): Promise<void> {
  console.log('Seeding games...');

  await prisma.$transaction(async (tx) => {
    await tx.game.deleteMany();
    console.log('Cleared existing game records.');

    await tx.game.createMany({
      data: gamesData,
    });
    console.log(`Created ${gamesData.length} games.`);
  });

  console.log('Games seeding finished.');
}
