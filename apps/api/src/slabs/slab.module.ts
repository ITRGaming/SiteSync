import { Module } from '@nestjs/common';
import { SlabController } from './slab.controller';
import { SlabService } from './slab.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slab } from './slab.entity';
import { Phase } from 'src/phases/phase.entity';
import { SlabExecutionReport } from './slab-execution-report.entity';
import { SlabReportsService } from './slab-reports.service';
import { SlabReportsController } from './slab-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Slab, Phase, SlabExecutionReport])],
  controllers: [SlabController, SlabReportsController],
  providers: [SlabService, SlabReportsService],
  exports: [SlabService, SlabReportsService],
})
export class SlabsModule {}
