import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PilesService } from './piles.service';
import { PilesController } from './piles.controller';
import { Pile } from './pile.entity';
import { Phase } from '../phases/phase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pile, Phase])],
  providers: [PilesService],
  controllers: [PilesController],
  exports: [PilesService],
})
export class PilesModule {}
