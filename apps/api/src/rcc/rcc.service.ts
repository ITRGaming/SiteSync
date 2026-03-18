import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rcc } from './rcc.entity';
import { User } from 'src/users/user.entity';
import { Phase, PhaseType } from '../phases/phase.entity';

@Injectable()
export class RccService {
  constructor(
    @InjectRepository(Rcc)
    private rccRepo: Repository<Rcc>,

    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,
  ) {}

  async createRcc(phaseId: number, name: string, user?: User) {
    const phase = await this.phaseRepo.findOne({
      where: {
        id: phaseId,
        type: PhaseType.RCC,
      },
    });

    if (!phase) throw new NotFoundException('Phase not found');

    const existing = await this.rccRepo.findOne({
      where: {
        name,
        phase: { id: phaseId },
      },
    });

    if (existing) {
      throw new BadRequestException(`RCC ${name} already exists`);
    }

    const rcc = this.rccRepo.create({
      name,
      phase,
      createdBy: { id: user?.id } as User,
      updatedBy: { id: user?.id } as User,
    });

    return this.rccRepo.save(rcc);
  }

  getRccsBySite(siteId: number) {
    return this.rccRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async updateRccLevel(rccId: number, level: number, user?: User) {
    const rcc = await this.rccRepo.findOne({
      where: { id: rccId },
    });

    if (!rcc) throw new NotFoundException('RCC not found');

    rcc.level = level;
    rcc.updatedBy = { id: user?.id } as User;
    rcc.updatedAt = new Date();

    return this.rccRepo.save(rcc);
  }
}
