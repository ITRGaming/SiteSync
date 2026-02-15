import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pile } from './pile.entity';
import { Phase, PhaseType } from '../phases/phase.entity';

@Injectable()
export class PilesService {
  constructor(
    @InjectRepository(Pile)
    private pileRepo: Repository<Pile>,

    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,
  ) {}

  async createPile(phaseId: number, pileNumber?: string) {
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
    });

    return this.pileRepo.save(pile);
  }

  async getPilesBySite(siteId: number) {
    return this.pileRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async updatePileNumber(pileId: number, pileNumber: string) {
    const pile = await this.pileRepo.findOne({ where: { id: pileId } });
    if (!pile) {
      throw new NotFoundException('Pile not found');
    }
    pile.pileNumber = pileNumber;
    return this.pileRepo.save(pile);
  }
}
