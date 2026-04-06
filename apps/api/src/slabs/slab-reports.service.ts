import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlabExecutionReport, SlabReportStatus } from './slab-execution-report.entity';
import { Slab, SlabStatus } from './slab.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class SlabReportsService {
  constructor(
    @InjectRepository(SlabExecutionReport)
    private reportRepo: Repository<SlabExecutionReport>,
    @InjectRepository(Slab)
    private slabRepo: Repository<Slab>,
  ) {}

  async getReport(slabId: number) {
    let report = await this.reportRepo.findOne({
      where: { slab: { id: slabId } },
      relations: ['slab'],
    });

    if (!report) {
      const slab = await this.slabRepo.findOne({ where: { id: slabId } });
      if (!slab) throw new NotFoundException('Slab not found');

      // Return a "virtual" draft if it doesn't exist yet
      return {
        slabId,
        status: SlabReportStatus.DRAFT,
        isLocked: false,
        checklistCovering: false,
        checklistSlabLevel: false,
        checklistPropsShuttering: false,
        checklistBindingWire: false,
        checklistReinforcement: false,
        checklistElectrical: false,
      };
    }

    return report;
  }

  async updateReport(slabId: number, data: any, user: User) {
    let report = await this.reportRepo.findOne({
      where: { slab: { id: slabId } },
    });

    if (report && report.isLocked) {
      throw new BadRequestException('Report is locked and cannot be edited');
    }

    if (!report) {
      const slab = await this.slabRepo.findOne({ where: { id: slabId } });
      if (!slab) throw new NotFoundException('Slab not found');

      report = this.reportRepo.create({
        slab: { id: slabId } as Slab,
        createdBy: { id: user.id } as User,
      });

      // Update slab status to IN_PROGRESS
      slab.status = SlabStatus.IN_PROGRESS;
      await this.slabRepo.save(slab);
    }

    // Map fields from data to report
    const fields = [
      'dateOfPour',
      'concreteGrade',
      'mixType',
      'checklistCovering',
      'checklistSlabLevel',
      'checklistPropsShuttering',
      'checklistBindingWire',
      'checklistReinforcement',
      'checklistElectrical',
      'siteMixDesign',
      'siteMixM1',
      'siteMixM2',
      'siteMixSand',
      'siteMixWater',
      'siteMixCementBrand',
      'siteMixCementKg',
      'siteMixAdmixSpec',
      'siteMixAdmixMl',
      'remarks',
    ];

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        report[field] = data[field];
      }
    });

    report.updatedBy = { id: user.id } as User;
    report.updatedAt = new Date();

    return this.reportRepo.save(report);
  }

  async submitReport(slabId: number, user: User) {
    const report = await this.reportRepo.findOne({
      where: { slab: { id: slabId } },
      relations: ['slab'],
    });

    if (!report) throw new NotFoundException('Report not found');
    if (report.isLocked) throw new BadRequestException('Report already submitted');

    report.status = SlabReportStatus.SUBMITTED;
    report.isLocked = true;
    report.submittedAt = new Date();
    report.submittedBy = { id: user.id } as User;
    report.updatedBy = { id: user.id } as User;

    await this.reportRepo.save(report);

    // Update slab status to COMPLETED
    const slab = await this.slabRepo.findOne({ where: { id: slabId } });
    if (slab) {
      slab.status = SlabStatus.COMPLETED;
      await this.slabRepo.save(slab);
    }

    return report;
  }
}
