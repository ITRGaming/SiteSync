import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PileExecutionReport } from './pile-execution-report.entity';
import { BoringLog } from './boring-log.entity';
import { ReinforcementEntry } from './reinforcement-entry.entity';
import { SitePhaseAttachment } from './site-phase-attachment.entity';
import { PileReportService } from './pile-report.service';
import { PileReportController } from './pile-report.controller';
import { Pile } from 'src/piles/pile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PileExecutionReport,
      BoringLog,
      ReinforcementEntry,
      SitePhaseAttachment,
      Pile,
    ]),
  ],
  providers: [PileReportService],
  controllers: [PileReportController],
})
export class PileReportModule {}
