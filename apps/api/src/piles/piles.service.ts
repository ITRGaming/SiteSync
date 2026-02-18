import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pile } from './pile.entity';
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

  async createPile(phaseId: number, pileNumber?: string, user?: any) {
    const phase = await this.phaseRepo.findOne({
      where: { id: phaseId },
    });

    if (!phase) throw new NotFoundException('Phase not found');

    if (phase.type !== PhaseType.PILES) {
      throw new BadRequestException(
        'Piles can only be created under PILES phase',
      );
    }

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
      createdBy: { id: user.id } as User,
      updatedBy: { id: user.id } as User,
    });

    return this.pileRepo.save(pile);
  }

  async getPilesBySite(siteId: number) {
    return this.pileRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: ['executionReport'],
    });
  }

  async updatePileNumber(pileId: number, pileNumber: string, user?: any) {
    const pile = await this.pileRepo.findOne({ where: { id: pileId } });
    if (!pile) {
      throw new NotFoundException('Pile not found');
    }
    pile.pileNumber = pileNumber;
    pile.updatedBy = { id: user.id } as User;
    return this.pileRepo.save(pile);
  }

  async updatePileStatus(
    pileId: number,
    body: {
      integrityStatus?: string;
      cube7DayStatus?: string;
      cube28DayStatus?: string;
      eccentricityStatus?: string;
    },
    user?: User,
  ) {
    const pile = await this.pileRepo.findOne({ where: { id: pileId } });
    if (!pile) throw new NotFoundException('Pile not found');
    if (body.integrityStatus !== undefined)
      pile.integrityStatus = body.integrityStatus;

    if (body.cube7DayStatus !== undefined)
      pile.cube7DayStatus = body.cube7DayStatus;

    if (body.cube28DayStatus !== undefined)
      pile.cube28DayStatus = body.cube28DayStatus;

    if (body.eccentricityStatus !== undefined)
      pile.eccentricityStatus = body.eccentricityStatus;

    if (user) pile.updatedBy = { id: user.id } as User;

    return this.pileRepo.save(pile);
  }
}
