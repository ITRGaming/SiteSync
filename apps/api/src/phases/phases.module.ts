import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import { Phase } from './phase.entity';
import { Site } from '../sites/site.entity';
import { Pile } from 'src/piles/pile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Phase, Site, Pile])],
  providers: [PhasesService],
  controllers: [PhasesController],
  exports: [PhasesService],
})
export class PhasesModule {}
