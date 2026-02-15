import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  PileExecutionReport,
  ReportStatus,
} from './pile-execution-report.entity';
import { BoringLog } from './boring-log.entity';
import { ReinforcementEntry } from './reinforcement-entry.entity';
import { Pile } from '../piles/pile.entity';
import { User } from '../users/user.entity';
import { UpdatePileReportDto } from './dto/update-pile-report.dto';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { PileStatus } from '../piles/pile.entity';

@Injectable()
export class PileReportService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PileExecutionReport)
    private reportRepo: Repository<PileExecutionReport>,
    @InjectRepository(Pile)
    private pileRepo: Repository<Pile>,
  ) {}

  async getOrCreateReport(pileId: number, user: User) {
    let report = await this.reportRepo.findOne({
      where: { pile: { id: pileId } },
      relations: ['boringLogs', 'reinforcementEntries'],
    });

    if (!report) {
      const pile = await this.pileRepo.findOneBy({ id: pileId });
      if (!pile) throw new NotFoundException('Pile not found');

      report = this.reportRepo.create({
        pile,
        createdBy: user,
      });

      await this.reportRepo.save(report);
    }

    return report;
  }

  async updateReport(pileId: number, dto: UpdatePileReportDto, user: User) {
    return this.dataSource.transaction(async (manager) => {
      const report = await manager.findOne(PileExecutionReport, {
        where: { pile: { id: pileId } },
        relations: ['boringLogs', 'reinforcementEntries', 'pile'],
      });

      if (!report) throw new NotFoundException();
      if (report.isLocked) throw new ForbiddenException('Report is locked');

      Object.assign(report, dto);

      if (dto.boringLogs) {
        await manager.delete(BoringLog, { report: { id: report.id } });

        report.boringLogs = dto.boringLogs.map((log) =>
          manager.create(BoringLog, { ...log, report }),
        );
      }

      if (dto.reinforcementEntries) {
        await manager.delete(ReinforcementEntry, { report: { id: report.id } });

        report.reinforcementEntries = dto.reinforcementEntries.map((entry) =>
          manager.create(ReinforcementEntry, { ...entry, report }),
        );
      }

      report.pile.status = PileStatus.IN_PROGRESS;

      return manager.save(report);
    });
  }

  async submitReport(pileId: number, user: User) {
    return this.dataSource.transaction(async (manager) => {
      const report = await manager.findOne(PileExecutionReport, {
        where: { pile: { id: pileId } },
        relations: ['boringLogs', 'reinforcementEntries', 'pile'],
      });

      if (!report) throw new NotFoundException();
      if (report.isLocked) throw new ForbiddenException();

      if (
        !report.reportDate ||
        !report.concreteGrade ||
        !report.pourStartTime ||
        !report.pourEndTime
      )
        throw new BadRequestException('Incomplete report');

      if (!report.boringLogs?.length)
        throw new BadRequestException('Add boring logs');

      if (!report.reinforcementEntries?.length)
        throw new BadRequestException('Add reinforcement entries');

      report.status = ReportStatus.SUBMITTED;
      report.isLocked = true;
      report.submittedAt = new Date();
      report.submittedBy = user;

      report.pile.status = PileStatus.COMPLETED;

      return manager.save(report);
    });
  }
}
