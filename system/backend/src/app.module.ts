import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CharacterModule } from './character/character.module';
import { InventoryModule } from './inventory/inventory.module';
import { DungeonModule } from './dungeon/dungeon.module';
import { BattleModule } from './battle/battle.module';
import { HealthController } from './health.controller';

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
    DungeonModule,
    BattleModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
