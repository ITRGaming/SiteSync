import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Phase, PhaseType } from './phase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from 'src/sites/site.entity';
import { Pile } from 'src/piles/pile.entity';
import { Rcc } from 'src/rcc/rcc.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,

    @InjectRepository(Site)
    private siteRepo: Repository<Site>,

    @InjectRepository(Pile)
    private pileRepo: Repository<Pile>,

    @InjectRepository(Rcc)
    private rccRepo: Repository<Rcc>,
  ) {}

  async getPhaseBySite(siteId: number) {
    return this.phaseRepo.find({
      where: { site: { id: siteId } },
      order: { id: 'ASC' },
    });
  }

  async updatePhase(id: number, action: string, user?: User) {
    const phase = await this.phaseRepo.findOne({
      where: { id },
    });

    if (!phase) throw new NotFoundException('Phase not found');

    if (action === 'start') {
      phase.startDate = new Date();
      phase.isActive = true;
      phase.updatedBy = { id: user?.id } as User;
      phase.updatedAt = new Date();
    }

    if (action === 'complete') {
      phase.isCompleted = true;
      phase.endDate = new Date();
      phase.updatedBy = { id: user?.id } as User;
      phase.updatedAt = new Date();
    }

    return this.phaseRepo.save(phase);
  }

  async startPilePhase(phaseId: number, totalPileCount: number, user?: User) {
    const phase = await this.phaseRepo.findOne({
      where: { id: phaseId },
      relations: ['site'],
    });

    if (!phase) throw new NotFoundException('Phase not found');

    if (phase.type !== PhaseType.PILES) {
      throw new BadRequestException('Not a Piles phase');
    }

    if (phase.totalPileCount) {
      throw new BadRequestException('Piles already generated');
    }

    phase.isActive = true;
    phase.startDate = new Date();
    phase.totalPileCount = totalPileCount;

    await this.phaseRepo.save(phase);

    const piles: Pile[] = [];

    for (let i = 0; i < totalPileCount; i++) {
      piles.push(
        this.pileRepo.create({
          site: phase.site,
          phase: phase,
          createdBy: { id: user?.id } as User,
          updatedBy: { id: user?.id } as User,
        }),
      );
    }

    await this.pileRepo.save(piles);

    return { message: 'Pile phase started and piles generated' };
  }

  async startRccPhase(phaseId: number, totalSlabCount: number, user?: User) {
    const phase = await this.phaseRepo.findOne({
      where: { id: phaseId },
      relations: ['site'],
    });

    if (!phase) throw new NotFoundException('Phase not found');

    if (phase.type !== PhaseType.RCC) {
      throw new BadRequestException('Not a RCC phase');
    }

    if (phase.totalSlabCount) {
      throw new BadRequestException('Slabs already generated');
    }

    phase.isActive = true;
    phase.startDate = new Date();
    phase.totalSlabCount = totalSlabCount;

    await this.phaseRepo.save(phase);

    const defaultLevels = [
      'Road level',
      'Pile Cap level',
      'Pile Beam level',
      'Made Up Ground level',
      'Plinth level',
    ];

    const rccs: Rcc[] = [];

    for (let i = 0; i < 5; i++) {
      rccs.push(
        this.rccRepo.create({
          site: phase.site,
          phase: phase,
          name: defaultLevels[i],
          createdBy: { id: user?.id } as User,
          updatedBy: { id: user?.id } as User,
        }),
      );
    }

    for (let i = 0; i < totalSlabCount; i++) {
      const num = i + 1;
      const j = num % 10;
      const k = num % 100;
      const prefix =
        j === 1 && k !== 11
          ? 'st'
          : j === 2 && k !== 12
            ? 'nd'
            : j === 3 && k !== 13
              ? 'rd'
              : 'th';
      rccs.push(
        this.rccRepo.create({
          site: phase.site,
          phase: phase,
          name: `${num}${prefix} slab`,
          createdBy: { id: user?.id } as User,
          updatedBy: { id: user?.id } as User,
        }),
      );
    }

    await this.rccRepo.save(rccs);

    return { message: 'RCC phase started and slabs generated' };
  }

  async repairMissingPhases() {
    const sites = await this.siteRepo.find({
      relations: ['phases'],
    });

    for (const site of sites) {
      if (!site.phases || site.phases.length === 0) {
        await this.phaseRepo.save([
          { type: PhaseType.PILES, site },
          { type: PhaseType.PLINTH, site },
          { type: PhaseType.RCC, site },
          { type: PhaseType.FINISHING, site },
          { type: PhaseType.PARKING, site },
        ]);
      }
    }

    return { message: 'Repair completed' };
  }
}
