import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventorySlotsModule } from './inventory-slots/inventory-slots.module';
import { DungeonModule } from './dungeon/dungeon.module';
import { DungeonFloorsModule } from './dungeon-floors/dungeon-floors.module';
import { BattleModule } from './battle/battle.module';
import { ProgressionModule } from './progression/progression.module';
import { RankedModule } from './ranked/ranked.module';
import { RankingsModule } from './rankings/rankings.module';
import { CraftModule } from './craft/craft.module';
import { UpgradeModule } from './upgrade/upgrade.module';
import { MarketModule } from './market/market.module';
import { GuildsModule } from './guilds/guilds.module';
import { VaultModule } from './vault/vault.module';
import { PvpModule } from './pvp/pvp.module';
import { ConsumableInventoryModule } from './consumable-inventory/consumable-inventory.module';
import { AdminModule } from './admin/admin.module';
import { HealthController } from './health.controller';
import { PortalModule } from './dungeon-rewards/portal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB ?? 'runewars',
      username: process.env.POSTGRES_USER ?? 'rw_user',
      password: process.env.POSTGRES_PASSWORD ?? 'rw_pass',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    CharacterModule,
    InventoryModule,
    InventorySlotsModule,
    DungeonModule,
    DungeonFloorsModule,
    BattleModule,
    ProgressionModule,
    RankedModule,
    RankingsModule,
    CraftModule,
    UpgradeModule,
    MarketModule,
    GuildsModule,
    VaultModule,
    PvpModule,
    ConsumableInventoryModule,
    PortalModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
