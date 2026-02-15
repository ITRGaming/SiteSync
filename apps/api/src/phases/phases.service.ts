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

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,

    @InjectRepository(Site)
    private siteRepo: Repository<Site>,

    @InjectRepository(Pile)
    private pileRepo: Repository<Pile>,
  ) {}

  async getPhaseBySite(siteId: number) {
    return this.phaseRepo.find({
      where: { site: { id: siteId } },
      order: { id: 'ASC' },
    });
  }

  async updatePhase(id: number, action: string) {
    const phase = await this.phaseRepo.findOne({
      where: { id },
    });

    if (!phase) throw new NotFoundException('Phase not found');

    if (action === 'start') {
      phase.startDate = new Date();
      phase.isActive = true;
    }

    if (action === 'complete') {
      phase.isCompleted = true;
      phase.endDate = new Date();
    }

    return this.phaseRepo.save(phase);
  }

  async startPilePhase(phaseId: number, totalPileCount: number) {
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
        }),
      );
    }

    await this.pileRepo.save(piles);

    return { message: 'Pile phase started and piles generated' };
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
