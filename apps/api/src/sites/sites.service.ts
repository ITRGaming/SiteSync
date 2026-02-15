import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './site.entity';
import { SiteAssignment } from './site-assignment.entity';
import { User } from '../users/user.entity';
import { Phase, PhaseType } from 'src/phases/phase.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private siteRepo: Repository<Site>,

    @InjectRepository(SiteAssignment)
    private assignmentRepo: Repository<SiteAssignment>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,
  ) {}

  async createSite(data: {
    name: string;
    location?: string;
    description?: string;
  }) {
    const site = this.siteRepo.create(data);
    const savedSite = await this.siteRepo.save(site);

    // Create default phase
    await this.phaseRepo.save([
      { type: PhaseType.PILES, site: savedSite },
      { type: PhaseType.PLINTH, site: savedSite },
      { type: PhaseType.RCC, site: savedSite },
      { type: PhaseType.FINISHING, site: savedSite },
      { type: PhaseType.PARKING, site: savedSite },
    ]);

    return savedSite;
  }

  async assignEngineer(siteId: number, userId: number) {
    const restrictedRoles = ['SUPER_ADMIN', 'ADMIN'];

    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (restrictedRoles.includes(user.role.name)) {
      throw new BadRequestException('Cannot assign admin users to sites');
    }

    const existing = await this.assignmentRepo.findOne({
      where: {
        site: { id: siteId },
        user: { id: userId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `${user.role.name} already assigned to ${site.name}`,
      );
    }

    const assignment = this.assignmentRepo.create({ site, user });

    return this.assignmentRepo.save(assignment);
  }

  async getSitesForUser(user: any, isActive?: string) {
    const activeFilter = isActive === undefined ? true : isActive === 'true';
    // Super Admin sees all
    if (user.role === 'SUPER_ADMIN') {
      return this.siteRepo.find({
        where: { isActive: activeFilter },
      });
    }

    const assignments = await this.assignmentRepo.find({
      where: { user: { id: user.userId }, site: { isActive: activeFilter } },
      relations: ['site'],
    });

    return assignments.map((a) => a.site);
  }

  async getSiteDetails(id: number, user: any) {
    if (!user) throw new BadRequestException('User not found');

    const site = await this.siteRepo.findOne({
      where: { id },
      relations: ['phases'],
    });

    return site;
  }

  async softDelete(id: number) {
    const site = await this.siteRepo.findOne({ where: { id, isActive: true } });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = false;
    return this.siteRepo.save(site);
  }

  async restore(id: number) {
    const site = await this.siteRepo.findOne({
      where: { id, isActive: false },
    });
    if (!site) throw new NotFoundException('Site not found');

    site.isActive = true;
    return this.siteRepo.save(site);
  }

  async hardDelete(id: number) {
    return this.siteRepo.delete(id);
  }
}
