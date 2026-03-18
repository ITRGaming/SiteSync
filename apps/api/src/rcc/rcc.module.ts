import { Module } from '@nestjs/common';
import { RccController } from './rcc.controller';
import { RccService } from './rcc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rcc } from './rcc.entity';
import { Phase } from 'src/phases/phase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rcc, Phase])],
  controllers: [RccController],
  providers: [RccService],
  exports: [RccService],
})
export class RccModule {}
