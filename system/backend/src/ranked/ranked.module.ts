import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankedProfile } from './ranked-profile.entity';
import { RankedService } from './ranked.service';
import { RankedController } from './ranked.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RankedProfile])],
  providers: [RankedService],
  controllers: [RankedController],
  exports: [RankedService],
})
export class RankedModule {}
