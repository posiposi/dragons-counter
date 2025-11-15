import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const gamesData = [
    {
      gameDate: new Date('2024-04-01'),
      opponent: '巨人',
      dragonsScore: 5,
      opponentScore: 3,
      result: 'WIN' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '開幕戦！大野雄大の好投で勝利',
    },
    {
      gameDate: new Date('2024-04-02'),
      opponent: '巨人',
      dragonsScore: 2,
      opponentScore: 7,
      result: 'LOSE' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '打線が振るわず完敗',
    },
    {
      gameDate: new Date('2024-04-03'),
      opponent: '巨人',
      dragonsScore: 4,
      opponentScore: 4,
      result: 'DRAW' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '延長戦の末引き分け',
    },
    {
      gameDate: new Date('2024-04-05'),
      opponent: 'ヤクルト',
      dragonsScore: 8,
      opponentScore: 2,
      result: 'WIN' as const,
      stadium: '神宮球場',
      notes: '打線爆発！8得点の大勝',
    },
    {
      gameDate: new Date('2024-04-06'),
      opponent: 'ヤクルト',
      dragonsScore: 3,
      opponentScore: 5,
      result: 'LOSE' as const,
      stadium: '神宮球場',
      notes: '終盤の逆転負け',
    },
    {
      gameDate: new Date('2024-04-07'),
      opponent: 'ヤクルト',
      dragonsScore: 6,
      opponentScore: 1,
      result: 'WIN' as const,
      stadium: '神宮球場',
      notes: '投手陣の完封リレー',
    },
    {
      gameDate: new Date('2024-04-09'),
      opponent: '横浜',
      dragonsScore: 1,
      opponentScore: 3,
      result: 'LOSE' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '投手戦の末惜敗',
    },
    {
      gameDate: new Date('2024-04-10'),
      opponent: '横浜',
      dragonsScore: 7,
      opponentScore: 0,
      result: 'WIN' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '完封勝利！チーム一丸の勝利',
    },
    {
      gameDate: new Date('2024-04-11'),
      opponent: '横浜',
      dragonsScore: 2,
      opponentScore: 2,
      result: 'DRAW' as const,
      stadium: 'バンテリンドーム ナゴヤ',
      notes: '雨天コールドで引き分け',
    },
    {
      gameDate: new Date('2024-04-13'),
      opponent: '阪神',
      dragonsScore: 4,
      opponentScore: 6,
      result: 'LOSE' as const,
      stadium: '甲子園球場',
      notes: '甲子園での熱戦も及ばず',
    },
  ];

  for (const gameData of gamesData) {
    const game = await prisma.game.create({
      data: gameData,
    });
    console.log(
      `Created game: ${game.opponent} vs 中日ドラゴンズ (${game.result})`,
    );
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
