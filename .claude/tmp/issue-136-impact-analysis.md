# Issue #136 影響分析表

## ファイル影響範囲マトリックス

| ファイルパス | 削除 | 修正 | 理由 | リスク度 |
|---|---|---|---|---|
| `backend/prisma/seed.ts` | ✓ |  | Prisma削除に伴い不要 | 高 |
| `backend/prisma/seeders/stadium.seed.ts` | ✓ |  | Prismashell実装 → TypeORM実装に置き換え | 高 |
| `backend/prisma/seeders/admin-user.seed.ts` | ✓ |  | Prisma実装 → TypeORM実装に置き換え | 高 |
| `backend/prisma/seeders/game.seed.ts` | ✓ |  | Prisma実装 → TypeORM実装に置き換え | 高 |
| `backend/prisma/schema.prisma` | ✓ |  | Prismaスキーマ | 高 |
| `backend/prisma/migrations/` | ✓ |  | Prismaマイグレーション | 高 |
| `backend/prisma.config.ts` | ✓ |  | Prisma設定 | 低 |
| `backend/src/infrastructure/prisma/prisma.module.ts` | ✓ |  | Prismaimportなし | 高 |
| `backend/src/infrastructure/prisma/prisma.service.ts` | ✓ |  | Prismaimportなし | 高 |
| `backend/src/domain/enums/user-role.ts` |  | ✓ | PrismaUserRoleへの依存削除 | 高 |
| `backend/src/domain/enums/registration-status.ts` |  | ✓ | PrismaRegistrationStatusへの依存削除 | 高 |
| `backend/src/app.module.ts` |  | ✓ | PrismaModuleのimport削除 | 中 |
| `backend/Dockerfile` |  | ✓ | Prismaコマンド削除 | 中 |
| `backend/package.json` |  | ✓ | @prisma/client, prisma削除 | 中 |
| `backend/src/infrastructure/typeorm/typeorm-integration.spec.ts` |  | ✓ | PrismaModule mock削除可能 | 低 |
| `backend/src/infrastructure/adapters/user-command.adapter.ts` |  |  | TypeORM実装済み（変更不要） | なし |
| `backend/src/infrastructure/adapters/user-query.adapter.ts` |  |  | TypeORM実装済み（変更不要） | なし |
| `backend/src/infrastructure/adapters/game.adapter.ts` |  |  | TypeORM実装済み（変更不要） | なし |

---

## 実装可能な粒度分割案

### フェーズ1: ドメイン層Prisma依存削除（1コミット）
**対象ファイル数**: 2
**説明**: ドメイン層からPrismaimportを削除し、スタンドアロン実装に変更
- `src/domain/enums/user-role.ts`
- `src/domain/enums/registration-status.ts`

### フェーズ2: NestJSモジュール構成変更（1コミット）
**対象ファイル数**: 3
**説明**: PrismaModuleの削除とapp.module.tsの修正
- `src/app.module.ts`
- `src/infrastructure/prisma/prisma.module.ts` （削除）
- `src/infrastructure/prisma/prisma.service.ts` （削除）

### フェーズ3: シーダー実装TypeORM化（1-3コミット）
**対象ファイル数**: 新規3 + 削除3
**説明**: TypeORMベースのシーダー実装に置き換え
- `src/infrastructure/seeders/stadium.seeder.ts` (新規)
- `src/infrastructure/seeders/admin-user.seeder.ts` (新規)
- `src/infrastructure/seeders/game.seeder.ts` (新規)
- `src/infrastructure/seeders/seeder.runner.ts` (新規)
- Prisma seeders削除

### フェーズ4: Prisma関連ファイル削除（1コミット）
**対象ファイル数**: 削除多数
**説明**: prismaディレクトリとPrisma設定完全削除
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma/migrations/`
- `prisma.config.ts`

### フェーズ5: Docker及びパッケージ設定更新（1コミット）
**対象ファイル数**: 2
**説明**: Dockerfileからprismaコマンド削除、package.jsonから依存削除
- `Dockerfile`
- `package.json`

---

## 各seedersの実装要件

### StadiumSeeder
**入力**: 12個のスタジアムデータ
**処理**:
- StadiumRepository.upsertで各スタジアムを登録
- 既存データは更新（createOrUpdate）

**TypeORMコード例**:
```typescript
@Injectable()
export class StadiumSeeder {
  constructor(private stadiumRepository: Repository<StadiumEntity>) {}
  
  async seed(): Promise<void> {
    for (const stadiumData of STADIUMS_DATA) {
      await this.stadiumRepository.upsert(
        { id: stadiumData.id },
        { create: stadiumData, update: {} }
      );
    }
  }
}
```

### AdminUserSeeder
**入力**: ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD環境変数
**処理**:
- User + UserRegistrationRequestを作成
- パスワードをbcryptでハッシュ化
- 既存の場合はスキップ

**TypeORMコード例**:
```typescript
@Injectable()
export class AdminUserSeeder {
  constructor(
    private userRepository: Repository<UserEntity>,
    private registrationRequestRepository: Repository<UserRegistrationRequestEntity>
  ) {}
  
  async seed(): Promise<void> {
    const { adminEmail, adminPassword } = this.getEnvVars();
    if (!adminEmail || !adminPassword) return;
    
    const existing = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (existing) return;
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const user = await this.userRepository.save({
      email: adminEmail,
      password: hashedPassword,
      role: UserRoleEnum.ADMIN
    });
    
    await this.registrationRequestRepository.save({
      userId: user.id,
      status: RegistrationStatusEnum.APPROVED
    });
  }
}
```

### GameSeeder
**入力**: 9個のゲームデータ
**処理**:
- 開発環境のみ実行
- 既存ゲーム削除してから新規作成
- トランザクション内で処理

**TypeORMコード例**:
```typescript
@Injectable()
export class GameSeeder {
  constructor(private gameRepository: Repository<GameEntity>) {}
  
  async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping games seeding in production.');
      return;
    }
    
    await this.gameRepository.delete({});
    await this.gameRepository.insert(GAMES_DATA);
  }
}
```

---

## 依存関係グラフ

```
app.module.ts
├── PrismaModule (削除)
│   ├── PrismaService (削除)
│   └── PrismaClient (削除)
├── TypeormModule (保持)
│   ├── GameEntity
│   ├── StadiumEntity
│   ├── UserEntity
│   └── UserRegistrationRequestEntity
├── GameModule
├── AuthModule
├── AdminModule
└── ScrapingModule

domain/enums/
├── user-role.ts (修正: Prisma依存削除)
└── registration-status.ts (修正: Prisma依存削除)

infrastructure/adapters/
├── game.adapter.ts (変更なし)
├── user-command.adapter.ts (変更なし)
└── user-query.adapter.ts (変更なし)

infrastructure/seeders/ (新規)
├── stadium.seeder.ts
├── admin-user.seeder.ts
├── game.seeder.ts
└── seeder.runner.ts
```

---

## テスト検証項目

### 単体テスト
- [ ] StadiumSeeder: 12個のスタジアムがupsertされること
- [ ] AdminUserSeeder: 管理者ユーザーが正しく作成されること
- [ ] GameSeeder: 開発環境でのみ9個のゲームが作成されること
- [ ] user-role.ts: PrismaUserRole依存が削除されていること
- [ ] registration-status.ts: PrismaRegistrationStatus依存が削除されていること

### 統合テスト
- [ ] TypeORMアダプター: seedersなしで動作すること
- [ ] app.module.ts: PrismaModule削除後も起動すること

### E2Eテスト
- [ ] Docker compose: Dockerfile修正後もビルド・起動が成功すること
- [ ] npm install: Prisma依存削除後のインストール成功
- [ ] Seeder実行: TypeORM実装されたseederが正常に実行されること

---

## 移行チェックリスト

- [ ] domain/enums修正テスト完了
- [ ] PrismaModule削除テスト完了
- [ ] TypeORMシーダー実装完了
- [ ] Dockerfile修正テスト完了
- [ ] package.json修正テスト完了
- [ ] 統合テスト実行成功
- [ ] E2Eテスト実行成功
- [ ] docker compose up確認
- [ ] シーダー実行確認

