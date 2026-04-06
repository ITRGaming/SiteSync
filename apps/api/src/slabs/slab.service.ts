import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slab } from './slab.entity';
import { User } from 'src/users/user.entity';
import { Phase, PhaseType } from '../phases/phase.entity';
import { Site } from 'src/sites/site.entity';

@Injectable()
export class SlabService {
  constructor(
    @InjectRepository(Slab)
    private slabRepo: Repository<Slab>,

    @InjectRepository(Phase)
    private siteRepo: Repository<Site>,
  ) {}

  async createSlab(siteId: number, name: string, user?: User) {
    const site = await this.siteRepo.findOne({
      where: {
        id: siteId,
      },
    });

    if (!site) throw new NotFoundException('Phase not found');

    const existing = await this.slabRepo.findOne({
      where: {
        name,
        site: { id: siteId },
      },
    });

    if (existing) {
      throw new BadRequestException(`Slab ${name} already exists`);
    }

    const slab = this.slabRepo.create({
      name,
      site,
      createdBy: { id: user?.id } as User,
      updatedBy: { id: user?.id } as User,
    });

    return this.slabRepo.save(slab);
  }

  getSlabsBySite(siteId: number) {
    return this.slabRepo.find({
      where: { site: { id: siteId } },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
  }

  async updateSlabLevel(slabId: number, level: number, user?: User) {
    const slab = await this.slabRepo.findOne({
      where: { id: slabId },
    });

    if (!slab) throw new NotFoundException('Slab not found');

    slab.level = level;
    slab.updatedBy = { id: user?.id } as User;
    slab.updatedAt = new Date();

    return this.slabRepo.save(slab);
  }
}
