import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pile, IntegrityStatus, EccentricityStatus } from './pile.entity';
import { Phase, PhaseType } from '../phases/phase.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class PilesService {
  constructor(
    @InjectRepository(Pile)
    private pileRepo: Repository<Pile>,

    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,
  ) {}

  async createPile(phaseId: number, pileNumber?: string, user?: User) {
    const phase = await this.phaseRepo.findOne({
      where: {
        id: phaseId,
        type: PhaseType.PILES,
      },
    });

    if (!phase) throw new NotFoundException('Phase not found');

    const existing = await this.pileRepo.findOne({
      where: {
        pileNumber,
        phase: { id: phaseId },
      },
    });

    if (existing) {
      throw new BadRequestException(`Pile ${pileNumber} already exists`);
    }

    const pile = this.pileRepo.create({
      pileNumber,
      phase,
      createdBy: { id: user?.id } as User,
      updatedBy: { id: user?.id } as User,
    });

    return this.pileRepo.save(pile);
  }

  async getPilesBySite(siteId: number) {
    return this.pileRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: ['executionReport', 'executionReport.boringLogs'],
    });
  }

  async updatePileNumber(pileId: number, pileNumber: string, user?: User) {
    const pile = await this.pileRepo.findOne({ where: { id: pileId } });
    if (!pile) {
      throw new NotFoundException('Pile not found');
    }
    if (pile.pileNumber === pileNumber) return pile;
    pile.pileNumber = pileNumber;
    pile.updatedBy = { id: user?.id } as User;
    pile.updatedAt = new Date();
    return this.pileRepo.save(pile);
  }

  async updatePileStatus(
    pileId: number,
    body: {
      integrityStatus?: any;
      cube7DayStatus?: string;
      cube28DayStatus?: string;
      eccentricityStatus?: any;
    },
    user?: User,
  ) {
    const pile = await this.pileRepo.findOne({ where: { id: pileId } });
    if (!pile) throw new NotFoundException('Pile not found');
    if (body.integrityStatus !== undefined)
      pile.integrityStatus = body.integrityStatus as IntegrityStatus;

    if (body.cube7DayStatus !== undefined)
      pile.cube7DayStatus = body.cube7DayStatus;

    if (body.cube28DayStatus !== undefined)
      pile.cube28DayStatus = body.cube28DayStatus;

    if (body.eccentricityStatus !== undefined)
      pile.eccentricityStatus = body.eccentricityStatus as EccentricityStatus;

    if (user) {
      pile.updatedBy = { id: user.id } as User;
      pile.updatedAt = new Date();
    }

    return this.pileRepo.save(pile);
  }
}
